# Data Labeling Module - Testing Guide

## 🗄️ Database Setup

1. **Go to Supabase Dashboard** → SQL Editor
2. **Run the SQL file**: `database/data-labeling-tables.sql`
3. **Verify tables created**:
   ```sql
   SELECT * FROM labeling_datasets;
   SELECT * FROM labeling_data;
   ```

## 🚀 Testing Flow

### 1. Upload Dataset
- Navigate to **Data Labeling** page
- Click **"⬆️ Upload Dataset"**
- Fill form:
  - **Name**: "Customer Support Q1"
  - **Label Type**: Intent
  - **CSV File**: Upload `sample-data/labeling-sample.csv`
- Click **"Create Dataset"**

### 2. Label Data
- Click **"🏷️ Label"** on your dataset
- You'll see text one-by-one:
  - Example: "I want to cancel my subscription"
- Click label button: **Billing, Support, Cancellation, Sales, Other**
- System automatically loads next row
- Or click **"Skip"** to skip the current row

### 3. Track Progress
- Return to dataset list (click **"← Back to Datasets"**)
- See progress bar showing: `5 / 15 labeled (33%)`
- Status updates automatically:
  - **Not Started** → **In Progress** → **Completed**

### 4. Export Data
- Click **"📥 Export"** button
- Downloads CSV file: `dataset_xxx_labeled.csv`
- Format:
  ```csv
  id,text,label
  1,I want to cancel my subscription,Cancellation
  2,My payment failed yesterday,Billing
  ```

### 5. Mark Completed
- Click **"✓ Complete"** button
- Status changes to **"Completed"**
- Dataset shows green badge

## 📊 Features Summary

✅ **CSV Upload** - Simple id,text format  
✅ **Label Types** - Intent & Sentiment  
✅ **One-by-one Labeling** - Clean UI  
✅ **Progress Tracking** - Real-time stats  
✅ **Skip Rows** - For uncertain cases  
✅ **Export CSV** - Download labeled data  
✅ **Status Management** - Not Started → In Progress → Completed  
✅ **Deduplication** - Won't re-upload same dataset  

## 🎨 UI Features

- **Gradient cards** with purple theme
- **Progress bars** showing completion
- **Status badges** (color-coded)
- **Hover animations** on all buttons
- **Responsive grid** layout
- **Empty states** with helpful messages

## 🔧 API Endpoints

- `GET /api/data-labeling/datasets` - List all datasets
- `POST /api/data-labeling/datasets` - Create dataset (multipart/form-data)
- `GET /api/data-labeling/datasets/:id` - Get dataset details
- `GET /api/data-labeling/datasets/:id/next` - Get next unlabeled row
- `POST /api/data-labeling/datasets/:id/label` - Label a row
- `POST /api/data-labeling/datasets/:id/skip` - Skip a row
- `GET /api/data-labeling/datasets/:id/export` - Export labeled CSV
- `POST /api/data-labeling/datasets/:id/complete` - Mark as completed

## 💡 Tips

- Use **Intent** for customer support ticket classification
- Use **Sentiment** for feedback/review analysis
- Export frequently to backup your work
- Skip rows when you're uncertain
- Mark dataset completed when done for organization
