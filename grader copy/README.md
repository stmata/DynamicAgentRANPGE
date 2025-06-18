# Grade Evaluation Service

Refactored grading service to evaluate student responses with a modular and maintainable architecture.

## 📁 Architecture

The architecture has been refactored to follow development best practices:

```
app/
├── models/          # Pydantic models for data validation
│   └── grade_models.py
├── services/        # Business logic and data processing  
│   └── grade_service.py
├── utils/           # Utilities and external clients
│   └── azure_client.py
└── routes/          # FastAPI endpoints (routes only)
    └── grade.py
```

## 🔧 Components

### 1. Models (`app/models/`)

Contains all Pydantic models for data validation and serialization:

- **`GradeRequest`** : Request model for standard grading
- **`GradeResponse`** : Response model for standard grading  
- **`CaseGradeRequest`** : Request model for case evaluation
- **`CaseGradeResponse`** : Response model for case evaluation
- **`DetailedAnalysis`** : Model for detailed analysis (strengths/improvements)

### 2. Services (`app/services/`)

Contains all grading business logic:

#### `GradeService`
- **`grade_user_answers()`** : Grading MCQ and open questions
- **`grade_case_evaluation()`** : Case study evaluation
- **`_process_mcq_question()`** : Multiple choice question processing
- **`_process_open_question()`** : Open-ended question processing
- **`_build_study_guide()`** : Personalized study guide generation
- **`_calculate_final_score()`** : Final score calculation

### 3. Utils (`app/utils/`)

Utilities and clients for external services:

#### `azure_client.py`
- **`get_azure_openai_client_with_llama_index()`** : Factory to create Azure OpenAI clients

### 4. Routes (`app/routes/`)

Simplified FastAPI endpoints that delegate to services:

- **`POST /grade`** : Standard response grading
- **`POST /grade-case`** : Case study evaluation

## 🚀 Features

### Standard Grading
- **MCQ Questions** : Direct comparison with correct answer
- **Open Questions** : LLM grading on a 0-10 scale
- **Study Guide** : Automatic generation based on errors
- **Final Score** : Weighted calculation on 100 points

### Case Evaluation
- **Contextual Analysis** : Taking case context into account
- **Evaluation Criteria** : Using custom criteria
- **Detailed Feedback** : Strengths and improvement areas
- **Weighted Score** : Grading on 100 with justification

## 🔄 Processing Flow

### 1. Standard Grading
```
Request → Validation → Processing by question type → Study guide → Final score
```

### 2. Case Evaluation  
```
Request → Context extraction → LLM prompt → Response validation → Result structuring
```

## 📦 Dependencies

- **FastAPI** : Web framework
- **Pydantic** : Data validation
- **LlamaIndex** : LLM interface
- **Azure OpenAI** : Text generation service
- **asyncio** : Asynchronous programming
- **concurrent.futures** : Parallel execution

## 🛠️ Configuration

### Required environment variables:

```env
AZURE_OPENAI_MODEL_AND_DEPLOYMENT_4omini=your-deployment-name
AZURE_OPENAI_ENDPOINT=https://your-endpoint.openai.azure.com/
AZURE_OPENAI_KEY=your-api-key
AZURE_OPENAI_API_VERSION=2024-02-15-preview
OPENAI_MODEL=gpt-4o-mini
```

## 📊 Performance

- **ThreadPoolExecutor** : 16 workers for blocking LLM calls
- **Asynchronous execution** : Non-blocking request processing
- **Optimized timeouts** : Efficient LLM response time management

## 🔒 Security

- **Strict validation** : All inputs validated by Pydantic
- **Error handling** : Robust fallbacks for LLM responses
- **Sanitization** : Cleaning of malformed JSON responses

## 🧪 Testing

To test the service locally:

```bash
# Start the service
./start.sh

# Test standard grading
curl -X POST "http://localhost:8000/grade" \
  -H "Content-Type: application/json" \
  -d '{
    "userID": "test-user",
    "questions": [["Question?", "A", "B", "C", "D", "A", ["ref1"]]],
    "responses": ["A"]
  }'

# Test case evaluation
curl -X POST "http://localhost:8000/grade-case" \
  -H "Content-Type: application/json" \
  -d '{
    "userID": "test-user",
    "case_data": {"case": {"title": "Test Case"}},
    "user_response": "My response to the case",
    "course": "Management",
    "level": "Master",
    "topics": ["Leadership"]
  }'
```

## 📈 Future Improvements

- [ ] Results caching for identical questions
- [ ] LLM performance metrics
- [ ] Multiple LLM model support
- [ ] Grading feedback API
- [ ] Evaluation analytics dashboard

## 🤝 Contribution

1. Respect the modular architecture
2. Maintain separation of concerns
3. Add tests for any new functionality
4. Document changes in this README 