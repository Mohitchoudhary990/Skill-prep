from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import numpy as np
import os
import random

app = Flask(__name__)
CORS(app)

# ─── Load Model ───────────────────────────────────────────────────────────────
MODEL_PATH = os.path.join(os.path.dirname(__file__), 'model.pkl')
_model_data = None

def get_model():
    global _model_data
    if _model_data is None and os.path.exists(MODEL_PATH):
        _model_data = joblib.load(MODEL_PATH)
    return _model_data

# ─── Skill Database ───────────────────────────────────────────────────────────
ROLE_SKILLS = {
    'SDE': {
        'core': ['Data Structures', 'Algorithms', 'System Design', 'OOP', 'DBMS', 'OS', 'Networks'],
        'languages': ['C++', 'Java', 'Python'],
        'frameworks': ['React', 'Node.js', 'Spring Boot'],
        'tools': ['Git', 'Docker', 'Linux', 'SQL'],
    },
    'AIML': {
        'core': ['Machine Learning', 'Deep Learning', 'Statistics', 'Linear Algebra', 'Probability', 'Data Structures'],
        'languages': ['Python', 'R'],
        'frameworks': ['TensorFlow', 'PyTorch', 'scikit-learn', 'Pandas', 'NumPy', 'Keras'],
        'tools': ['Git', 'Jupyter', 'SQL', 'Docker'],
    },
    'Data Analyst': {
        'core': ['Statistics', 'Probability', 'Data Visualization', 'SQL', 'Excel', 'Data Wrangling'],
        'languages': ['Python', 'R', 'SQL'],
        'frameworks': ['Pandas', 'NumPy', 'Matplotlib', 'Seaborn', 'Tableau', 'Power BI'],
        'tools': ['Git', 'Excel', 'Jupyter', 'Tableau'],
    },
}

COMPANY_FOCUS = {
    'Product': {'weight_dsa': 0.45, 'weight_sys': 0.35, 'weight_comm': 0.20},
    'Service': {'weight_dsa': 0.25, 'weight_sys': 0.15, 'weight_comm': 0.60},
}

# ─── Mock Interview DB ────────────────────────────────────────────────────────
INTERVIEW_QUESTIONS = {
    'SDE': {
        'Product': [
            {
                'question': 'Implement a function to find the longest substring without repeating characters.',
                'topic': 'Sliding Window / Hashing',
                'difficulty': 'Medium',
                'model_answer': 'Use a sliding window approach with a hash map/set to track characters. Keep left and right pointers. When a duplicate is found, move left pointer past the previous occurrence. Time: O(n), Space: O(min(n,k)) where k is charset size.',
                'keywords': ['sliding window', 'hashmap', 'two pointer', 'O(n)', 'set', 'pointer']
            },
            {
                'question': 'Design a URL shortening service like bit.ly. Discuss database schema, hashing, and scalability.',
                'topic': 'System Design',
                'difficulty': 'Hard',
                'model_answer': 'Use base62 encoding of a counter or MD5/SHA hash truncated to 6-7 chars. DB schema: id, shortURL, longURL, createdAt, clicks. Use Redis cache for hot URLs. Add load balancer. Use consistent hashing for distributed storage.',
                'keywords': ['base62', 'hash', 'redis', 'cache', 'database', 'load balancer', 'scalability', 'schema']
            },
            {
                'question': 'Given a binary tree, find the diameter (longest path between any two nodes).',
                'topic': 'Trees / DFS',
                'difficulty': 'Medium',
                'model_answer': 'Use DFS. For each node, diameter = left_height + right_height. Track global max. Return height = 1 + max(left, right) to parent. Time: O(n).',
                'keywords': ['dfs', 'recursion', 'height', 'postorder', 'tree', 'O(n)']
            },
        ],
        'Service': [
            {
                'question': 'Implement a RESTful CRUD API in any language. What HTTP methods and status codes would you use?',
                'topic': 'REST APIs',
                'difficulty': 'Easy',
                'model_answer': 'GET (200/404), POST (201), PUT/PATCH (200/204), DELETE (204/404). Use proper routes like /users/{id}. Return JSON, handle errors gracefully with appropriate status codes.',
                'keywords': ['GET', 'POST', 'PUT', 'DELETE', 'REST', 'status code', '200', '201', '404', 'JSON']
            },
            {
                'question': 'Explain the difference between SQL and NoSQL databases. When would you use each?',
                'topic': 'Databases',
                'difficulty': 'Medium',
                'model_answer': 'SQL: structured, ACID, good for relational data (e.g. MySQL, PostgreSQL). NoSQL: flexible schema, scalable, good for unstructured/semi-structured data (MongoDB, Cassandra). Use SQL for transactions; NoSQL for logs, user profiles, real-time feeds.',
                'keywords': ['SQL', 'NoSQL', 'ACID', 'relational', 'schema', 'MongoDB', 'transactions', 'scalable']
            },
        ],
    },
    'AIML': {
        'Product': [
            {
                'question': 'Explain the bias-variance tradeoff and how you would address high bias vs high variance in an ML model.',
                'topic': 'ML Fundamentals',
                'difficulty': 'Medium',
                'model_answer': 'High bias (underfitting): add more features, increase model complexity, use ensemble methods. High variance (overfitting): add more data, regularization (L1/L2), dropout, pruning, cross-validation. The tradeoff means reducing one often increases the other.',
                'keywords': ['bias', 'variance', 'underfitting', 'overfitting', 'regularization', 'complexity', 'cross-validation']
            },
            {
                'question': 'How does backpropagation work in a neural network? Explain the chain rule.',
                'topic': 'Deep Learning',
                'difficulty': 'Hard',
                'model_answer': 'Backprop computes gradients of loss w.r.t. each weight using the chain rule. Forward pass computes outputs. Backward pass: dL/dW = dL/dout * dout/dW. Gradients flow backwards through the network layers, updating weights via gradient descent.',
                'keywords': ['gradient', 'chain rule', 'loss', 'derivative', 'forward pass', 'backward', 'weights', 'gradient descent']
            },
        ],
        'Service': [
            {
                'question': 'What is the difference between supervised and unsupervised learning? Give 3 examples of each.',
                'topic': 'ML Basics',
                'difficulty': 'Easy',
                'model_answer': 'Supervised: labeled data. Examples: Linear Regression, SVM, Random Forest, Neural Networks, Decision Trees. Unsupervised: no labels. Examples: K-Means, PCA, DBSCAN, Autoencoders, Hierarchical Clustering.',
                'keywords': ['supervised', 'unsupervised', 'labeled', 'classification', 'clustering', 'regression', 'k-means', 'PCA']
            },
        ],
    },
    'Data Analyst': {
        'Product': [
            {
                'question': 'How would you handle missing values in a dataset? List at least 4 strategies.',
                'topic': 'Data Cleaning',
                'difficulty': 'Medium',
                'model_answer': 'Mean/median/mode imputation, forward/backward fill (time series), KNN imputation, model-based imputation, indicator variable for missingness, MICE, or simply drop rows/cols if missing fraction is high.',
                'keywords': ['imputation', 'mean', 'median', 'drop', 'KNN', 'MICE', 'missing', 'fill']
            },
        ],
        'Service': [
            {
                'question': 'Write a SQL query to find the top 5 customers by total purchase amount in the last 30 days.',
                'topic': 'SQL',
                'difficulty': 'Medium',
                'model_answer': 'SELECT customer_id, SUM(amount) as total FROM orders WHERE order_date >= CURRENT_DATE - 30 GROUP BY customer_id ORDER BY total DESC LIMIT 5;',
                'keywords': ['SELECT', 'SUM', 'GROUP BY', 'ORDER BY', 'LIMIT', 'WHERE', 'aggregate']
            },
        ],
    },
}

# ─── Roadmap Database ─────────────────────────────────────────────────────────
ROADMAP_TOPICS = {
    'graphs': {
        'title': 'Graph Algorithms',
        'resources': [
            {'title': 'Graph Theory Crash Course', 'url': 'https://youtu.be/tWVWeAqZ0WU', 'type': 'video'},
            {'title': 'LeetCode Graph Problems', 'url': 'https://leetcode.com/tag/graph/', 'type': 'practice'},
            {'title': 'CP-Algorithms Graphs', 'url': 'https://cp-algorithms.com/graph/breadth-first-search.html', 'type': 'article'},
        ],
        'problems': ['Number of Islands', 'Course Schedule', 'Shortest Path', 'Detect Cycle', 'Topological Sort'],
        'duration': '2 weeks',
    },
    'dynamic programming': {
        'title': 'Dynamic Programming',
        'resources': [
            {'title': 'DP for Beginners — Neetcode', 'url': 'https://youtu.be/oBt53YbR9Kk', 'type': 'video'},
            {'title': 'LeetCode DP Problems', 'url': 'https://leetcode.com/tag/dynamic-programming/', 'type': 'practice'},
        ],
        'problems': ['Climbing Stairs', 'Coin Change', 'Longest Common Subsequence', 'Knapsack', 'Edit Distance'],
        'duration': '3 weeks',
    },
    'system design': {
        'title': 'System Design',
        'resources': [
            {'title': 'System Design Primer', 'url': 'https://github.com/donnemartin/system-design-primer', 'type': 'article'},
            {'title': 'Gaurav Sen YouTube', 'url': 'https://www.youtube.com/@gkcs', 'type': 'video'},
        ],
        'problems': ['Design URL Shortener', 'Design Twitter Feed', 'Design Cache', 'Design Rate Limiter'],
        'duration': '4 weeks',
    },
    'machine learning': {
        'title': 'Machine Learning Fundamentals',
        'resources': [
            {'title': 'Coursera ML (Andrew Ng)', 'url': 'https://www.coursera.org/learn/machine-learning', 'type': 'course'},
            {'title': 'Kaggle Learn ML', 'url': 'https://www.kaggle.com/learn/machine-learning', 'type': 'course'},
        ],
        'problems': ['Iris Classification', 'House Price Prediction', 'Titanic Survival', 'MNIST Digit Recognition'],
        'duration': '4 weeks',
    },
    'linear algebra': {
        'title': 'Linear Algebra for ML',
        'resources': [
            {'title': '3Blue1Brown Essence of Linear Algebra', 'url': 'https://youtube.com/playlist?list=PLZHQObOWTQDPD3MizzM2xVFitgF8hE_ab', 'type': 'video'},
            {'title': 'Fast.ai Linear Algebra', 'url': 'https://www.fast.ai/', 'type': 'course'},
        ],
        'problems': ['Matrix Multiplication', 'Eigenvalues', 'SVD', 'PCA from scratch'],
        'duration': '2 weeks',
    },
    'sql': {
        'title': 'SQL & Databases',
        'resources': [
            {'title': 'SQLZoo Interactive', 'url': 'https://sqlzoo.net/', 'type': 'practice'},
            {'title': 'LeetCode SQL Problems', 'url': 'https://leetcode.com/problemset/database/', 'type': 'practice'},
            {'title': 'Mode SQL Tutorial', 'url': 'https://mode.com/sql-tutorial/', 'type': 'article'},
        ],
        'problems': ['Employees Earning More Than Managers', 'Rank Scores', 'Consecutive Numbers'],
        'duration': '2 weeks',
    },
    'communication': {
        'title': 'Communication & Soft Skills',
        'resources': [
            {'title': 'HR Interview Questions & Answers', 'url': 'https://www.indiabix.com/hr-interview/questions-and-answers/', 'type': 'article'},
            {'title': 'Mock GD Practice', 'url': 'https://www.youtube.com/results?search_query=group+discussion+practice', 'type': 'video'},
        ],
        'problems': ['Practice STAR method answers', 'Record yourself answering common HR questions', 'Join Toastmasters or public speaking club'],
        'duration': 'Ongoing',
    },
    'react': {
        'title': 'React & Frontend Development',
        'resources': [
            {'title': 'React Official Docs', 'url': 'https://react.dev/', 'type': 'article'},
            {'title': 'Scrimba React Course', 'url': 'https://scrimba.com/learn/learnreact', 'type': 'course'},
        ],
        'problems': ['Build a Todo App', 'Build a Weather App with API', 'Build a E-Commerce Cart'],
        'duration': '3 weeks',
    },
    'trees': {
        'title': 'Trees & Binary Search Trees',
        'resources': [
            {'title': 'Neetcode Trees Playlist', 'url': 'https://youtube.com/playlist?list=PLot-Xpze53leNZQd0iINpD-MAhMOMzWvO', 'type': 'video'},
            {'title': 'LeetCode Tree Problems', 'url': 'https://leetcode.com/tag/tree/', 'type': 'practice'},
        ],
        'problems': ['Inorder Traversal', 'Validate BST', 'LCA of BST', 'Level Order Traversal', 'Diameter of Tree'],
        'duration': '2 weeks',
    },
    'data structures': {
        'title': 'Core Data Structures',
        'resources': [
            {'title': 'Abdul Bari DSA Course', 'url': 'https://www.youtube.com/playlist?list=PLIY8eNdw5tW_zX3OCzX7NJ8bL1p6pWfgG', 'type': 'video'},
            {'title': 'LeetCode Top Interview 150', 'url': 'https://leetcode.com/studyplan/top-interview-150/', 'type': 'practice'},
        ],
        'problems': ['Array Rotation', 'Linked List Cycle', 'Valid Parentheses', 'LRU Cache', 'Sliding Window Maximum'],
        'duration': '4 weeks',
    },
}

SKILL_KEYWORD_MAP = {
    'graph': 'graphs', 'graphs': 'graphs',
    'dp': 'dynamic programming', 'dynamic programming': 'dynamic programming',
    'system design': 'system design',
    'ml': 'machine learning', 'machine learning': 'machine learning',
    'deep learning': 'machine learning',
    'linear algebra': 'linear algebra',
    'sql': 'sql', 'database': 'sql', 'databases': 'sql',
    'communication': 'communication', 'hr': 'communication', 'soft skills': 'communication',
    'react': 'react', 'frontend': 'react',
    'tree': 'trees', 'trees': 'trees', 'bst': 'trees',
    'dsa': 'data structures', 'data structures': 'data structures', 'arrays': 'data structures',
}

# ──────────────────────────────────────────────────────────────────────────────
# ENDPOINT 1: Placement Readiness Predictor
# ──────────────────────────────────────────────────────────────────────────────
@app.route('/predict', methods=['POST'])
def predict():
    data = request.get_json()
    required = ['cgpa', 'dsa_solved', 'ml_projects', 'internship', 'communication']
    for field in required:
        if field not in data:
            return jsonify({'error': f'Missing field: {field}'}), 400

    model_data = get_model()
    if model_data is None:
        return jsonify({'error': 'Model not trained. Run train_model.py first.'}), 503

    model    = model_data['model']
    features = model_data['features']

    X = np.array([[
        float(data.get('cgpa', 0)),
        float(data.get('dsa_solved', 0)),
        float(data.get('ml_projects', 0)),
        int(data.get('internship', 0)),
        float(data.get('communication', 5)),
        float(data.get('open_source_contribs', 0)),
        float(data.get('hackathons', 0)),
    ]])

    prob = model.predict_proba(X)[0][1]
    placed = bool(model.predict(X)[0])
    probability = round(prob * 100, 1)

    # Determine tier
    if probability >= 80:
        tier = 'Excellent'
        color = '#10b981'
        message = '🔥 You are highly placement-ready! Target top product companies.'
    elif probability >= 60:
        tier = 'Good'
        color = '#3b82f6'
        message = '✅ You are on track. Focus on weak areas to boost your score further.'
    elif probability >= 40:
        tier = 'Average'
        color = '#f59e0b'
        message = '⚡ You have good potential. Work on DSA and projects consistently.'
    else:
        tier = 'Needs Work'
        color = '#ef4444'
        message = '💪 Don\'t worry — consistent effort in DSA and projects will improve this quickly.'

    # Feature importances for recommendations
    importances = model.feature_importances_
    feat_imp = dict(zip(features, importances))

    recommendations = []
    cgpa = float(data.get('cgpa', 0))
    dsa  = float(data.get('dsa_solved', 0))
    mle  = float(data.get('ml_projects', 0))
    comm = float(data.get('communication', 5))

    if cgpa < 7.0:
        recommendations.append('Improve your CGPA — aim for 7.5+')
    if dsa < 150:
        recommendations.append('Solve more DSA problems: aim 300+ on LeetCode')
    if mle < 2:
        recommendations.append('Build 2-3 strong ML/tech projects with GitHub')
    if not int(data.get('internship', 0)):
        recommendations.append('Apply for internships (even unpaid) to gain experience')
    if comm < 6:
        recommendations.append('Practice communication: mock HR + group discussions')

    return jsonify({
        'probability': probability,
        'placed': placed,
        'tier': tier,
        'color': color,
        'message': message,
        'recommendations': recommendations,
    })

# ──────────────────────────────────────────────────────────────────────────────
# ENDPOINT 2: Skill Gap Analyzer
# ──────────────────────────────────────────────────────────────────────────────
@app.route('/skill-gap', methods=['POST'])
def skill_gap():
    data = request.get_json()
    role            = data.get('role', 'SDE')
    user_skills_raw = data.get('skills', [])
    dsa_solved      = int(data.get('dsa_solved', 0))
    projects        = data.get('projects', [])

    # Normalize user skills
    user_skills = set(s.strip().lower() for s in user_skills_raw)

    role_data = ROLE_SKILLS.get(role, ROLE_SKILLS['SDE'])
    all_required = []
    for category in role_data.values():
        all_required.extend(category)

    # Match skills
    matched    = []
    missing    = []
    weak       = []

    for skill in all_required:
        skill_lower = skill.lower()
        # Direct or partial match
        found = skill_lower in user_skills or any(
            skill_lower in us or us in skill_lower
            for us in user_skills
        )
        if found:
            matched.append(skill)
        else:
            missing.append(skill)

    # Weak area detection
    if dsa_solved < 100:
        weak.append({'area': 'DSA Practice', 'reason': f'Only {dsa_solved} problems solved. Target 300+.'})
    if dsa_solved < 300 and role == 'SDE':
        weak.append({'area': 'Competitive Programming', 'reason': 'Product companies expect 300+ quality problems.'})
    if len(projects) < 2:
        weak.append({'area': 'Projects', 'reason': f'Only {len(projects)} project(s) listed. Add 2-3 strong projects.'})

    # Compute readiness
    coverage = len(matched) / max(len(all_required), 1)
    dsa_bonus = min(dsa_solved / 500, 1) * 0.2
    proj_bonus = min(len(projects) / 3, 1) * 0.1
    readiness = round((coverage * 0.7 + dsa_bonus + proj_bonus) * 100, 1)

    # Categorize missing skills
    missing_by_cat = {}
    for cat, skills in role_data.items():
        cat_missing = [s for s in skills if s in missing]
        if cat_missing:
            missing_by_cat[cat] = cat_missing

    return jsonify({
        'role': role,
        'readiness_score': readiness,
        'matched_skills': matched,
        'missing_skills': missing,
        'missing_by_category': missing_by_cat,
        'weak_areas': weak,
        'total_required': len(all_required),
        'total_matched': len(matched),
    })

# ──────────────────────────────────────────────────────────────────────────────
# ENDPOINT 3: AI Mock Interview
# ──────────────────────────────────────────────────────────────────────────────
@app.route('/mock-interview', methods=['POST'])
def mock_interview():
    data = request.get_json()
    role         = data.get('role', 'SDE')
    company_type = data.get('company_type', 'Product')
    action       = data.get('action', 'get_question')

    role_q = INTERVIEW_QUESTIONS.get(role, INTERVIEW_QUESTIONS['SDE'])
    company_q = role_q.get(company_type, list(role_q.values())[0])

    if action == 'get_question':
        question_idx = data.get('question_idx', 0)
        q = company_q[question_idx % len(company_q)]
        return jsonify({
            'question': q['question'],
            'topic': q['topic'],
            'difficulty': q['difficulty'],
            'question_idx': question_idx,
            'total_questions': len(company_q),
        })

    elif action == 'evaluate':
        user_answer  = data.get('answer', '').lower()
        question_idx = data.get('question_idx', 0)
        q = company_q[question_idx % len(company_q)]
        keywords = q.get('keywords', [])

        # Keyword-based scoring
        matched_kw = [kw for kw in keywords if kw.lower() in user_answer]
        keyword_score = len(matched_kw) / max(len(keywords), 1)

        # Length scoring (proxy for depth)
        words = len(user_answer.split())
        if words < 20:
            depth_score = 0.2
            depth_feedback = 'Too brief — elaborate more on your approach.'
        elif words < 60:
            depth_score = 0.5
            depth_feedback = 'Good start but add more detail and examples.'
        elif words < 150:
            depth_score = 0.8
            depth_feedback = 'Good depth of explanation.'
        else:
            depth_score = 1.0
            depth_feedback = 'Excellent depth and elaboration.'

        # Clarity (sentence structure proxy)
        sentences = [s.strip() for s in user_answer.replace('!', '.').replace('?', '.').split('.') if s.strip()]
        clarity_score = min(len(sentences) / 5, 1.0)

        # Weighted total
        tech_score  = round(keyword_score * 10, 1)
        depth_score_10 = round(depth_score * 10, 1)
        clarity_10  = round(clarity_score * 10, 1)
        overall     = round((tech_score * 0.5 + depth_score_10 * 0.3 + clarity_10 * 0.2), 1)

        # Feedback generation
        feedback_lines = []
        if keyword_score < 0.3:
            feedback_lines.append(f"❌ Missing key concepts: {', '.join(kw for kw in keywords if kw.lower() not in user_answer[:3] if keywords)}.")
        elif keyword_score < 0.6:
            feedback_lines.append(f"⚡ You mentioned some key points but missed: {', '.join(kw for kw in keywords if kw.lower() not in user_answer)[:3]}.")
        else:
            feedback_lines.append(f"✅ Great coverage of key concepts: {', '.join(matched_kw[:4])}.")

        feedback_lines.append(depth_feedback)

        if overall >= 8:
            grade = 'Excellent'
        elif overall >= 6:
            grade = 'Good'
        elif overall >= 4:
            grade = 'Average'
        else:
            grade = 'Needs Improvement'

        return jsonify({
            'scores': {
                'technical':  tech_score,
                'depth':      depth_score_10,
                'clarity':    clarity_10,
                'overall':    overall,
            },
            'grade': grade,
            'feedback': ' '.join(feedback_lines),
            'model_answer': q['model_answer'],
            'matched_keywords': matched_kw,
            'topic': q['topic'],
        })

    return jsonify({'error': 'Invalid action'}), 400

# ──────────────────────────────────────────────────────────────────────────────
# ENDPOINT 4: Personalized Learning Roadmap
# ──────────────────────────────────────────────────────────────────────────────
@app.route('/roadmap', methods=['POST'])
def roadmap():
    data         = request.get_json()
    weak_areas   = data.get('weak_areas', [])
    role         = data.get('role', 'SDE')
    dsa_solved   = int(data.get('dsa_solved', 0))
    target_weeks = int(data.get('target_weeks', 12))

    if not weak_areas:
        # Auto-detect based on role and stats
        if role == 'SDE':
            weak_areas = ['data structures', 'graphs', 'system design']
        elif role == 'AIML':
            weak_areas = ['machine learning', 'linear algebra']
        else:
            weak_areas = ['sql', 'communication']

    # Map to roadmap topics
    mapped_topics = set()
    for area in weak_areas:
        area_l = area.lower().strip()
        for keyword, topic_key in SKILL_KEYWORD_MAP.items():
            if keyword in area_l or area_l in keyword:
                mapped_topics.add(topic_key)
                break
        else:
            # If no mapping, try direct key
            if area_l in ROADMAP_TOPICS:
                mapped_topics.add(area_l)

    # Always add DSA if beginner
    if dsa_solved < 100:
        mapped_topics.add('data structures')

    roadmap_items = []
    week_offset = 1
    for topic_key in mapped_topics:
        topic = ROADMAP_TOPICS.get(topic_key)
        if topic:
            roadmap_items.append({
                'title': topic['title'],
                'resources': topic['resources'],
                'practice_problems': topic['problems'],
                'duration': topic['duration'],
                'start_week': week_offset,
                'priority': 'High' if week_offset <= 4 else 'Medium',
            })
            # advance weeks by duration
            dur = topic['duration'].split()[0]
            week_offset += int(dur) if dur.isdigit() else 2

    # Sort by start week
    roadmap_items.sort(key=lambda x: x['start_week'])

    return jsonify({
        'role': role,
        'target_weeks': target_weeks,
        'roadmap': roadmap_items,
        'total_topics': len(roadmap_items),
        'tip': 'Consistency beats intensity. Dedicate 3-4 hours daily and track weekly progress.',
    })

# ─── Health ───────────────────────────────────────────────────────────────────
@app.route('/health', methods=['GET'])
def health():
    model_ready = os.path.exists(MODEL_PATH)
    return jsonify({'status': 'ok', 'model_loaded': model_ready})

if __name__ == '__main__':
    print("🚀 Starting Flask ML Service on port 8000...")
    model_data = get_model()
    if model_data:
        print("✅ Model loaded successfully")
    else:
        print("⚠️  Model not found. Run train_model.py first.")
    app.run(host='0.0.0.0', port=8000, debug=True)
