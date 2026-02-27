import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report
import joblib
import os

np.random.seed(42)

# ─── Synthetic Dataset ────────────────────────────────────────────────────────
n = 2000

cgpa               = np.random.uniform(5.0, 10.0, n)
dsa_solved         = np.random.randint(0, 600, n)
ml_projects        = np.random.randint(0, 8, n)
internship         = np.random.randint(0, 2, n)          # 0 or 1
communication      = np.random.uniform(1, 10, n)
open_source_contribs = np.random.randint(0, 20, n)
hackathons         = np.random.randint(0, 10, n)

# Score-based placement rule (realistic weights)
score = (
    (cgpa - 5) / 5 * 30
    + np.clip(dsa_solved / 600, 0, 1) * 25
    + np.clip(ml_projects / 5,  0, 1) * 10
    + internship * 12
    + (communication - 1) / 9 * 15
    + np.clip(open_source_contribs / 10, 0, 1) * 5
    + np.clip(hackathons / 5, 0, 1) * 3
    + np.random.normal(0, 3, n)   # noise
)

placed = (score >= 50).astype(int)

df = pd.DataFrame({
    'cgpa': cgpa,
    'dsa_solved': dsa_solved,
    'ml_projects': ml_projects,
    'internship': internship,
    'communication': communication,
    'open_source_contribs': open_source_contribs,
    'hackathons': hackathons,
    'placed': placed,
})

print(f"Dataset: {n} samples | Placed: {placed.sum()} ({placed.mean()*100:.1f}%)")

# ─── Train ────────────────────────────────────────────────────────────────────
FEATURES = ['cgpa', 'dsa_solved', 'ml_projects', 'internship',
            'communication', 'open_source_contribs', 'hackathons']

X = df[FEATURES]
y = df['placed']

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

model = RandomForestClassifier(
    n_estimators=200,
    max_depth=10,
    min_samples_split=5,
    random_state=42,
    n_jobs=-1
)
model.fit(X_train, y_train)

y_pred = model.predict(X_test)
acc = accuracy_score(y_test, y_pred)
print(f"\nAccuracy: {acc*100:.2f}%")
print(classification_report(y_test, y_pred, target_names=['Not Placed', 'Placed']))

# Feature importances
importances = model.feature_importances_
for feat, imp in sorted(zip(FEATURES, importances), key=lambda x: -x[1]):
    print(f"  {feat:25s} {imp:.4f}")

# ─── Save ─────────────────────────────────────────────────────────────────────
out_path = os.path.join(os.path.dirname(__file__), 'model.pkl')
joblib.dump({'model': model, 'features': FEATURES}, out_path)
print(f"\n✅ Model saved to {out_path}")
