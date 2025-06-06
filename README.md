# BI Dashboard with Filter Optimization

This project consists of a React frontend dashboard for visualizing and filtering data from CSV files, and a Node.js backend for uploading these files to AWS S3.

## Project Structure

```
Loop/
├── backend/
│   ├── node_modules/
│   ├── package.json
│   ├── server.js
│   └── .env  (Create this file)
├── filter-optimization/
│   ├── node_modules/
│   ├── public/
│   │   └── (Your CSV files can be placed here if not using S3 upload)
│   ├── src/
│   ├── package.json
│   ├── tsconfig.json
│   └── .env (Optional, for REACT_APP_BACKEND_URL if not hardcoded)
└── README.md (This file)
```

## Local Setup

To run this project locally, you need to set up both the backend and the frontend.

### 1. Backend Setup (Node.js Server)

This server handles uploading CSV files to an AWS S3 bucket.

1.  Navigate to the `backend` directory in your terminal:

    ```bash
    cd backend
    ```

2.  Install the necessary Node.js dependencies:

    ```bash
    npm install
    ```

3.  **AWS Configuration:**
    *   Create an AWS S3 bucket where files will be uploaded.
    *   Create an IAM user with **Programmatic access**.
    *   Attach a policy to this user that grants `s3:PutObject` permissions to your specific S3 bucket (e.g., `arn:aws:s3:::YOUR_S3_BUCKET_NAME/*`).
    *   **Important:** Retrieve the `Access key ID` and `Secret access key` for this user. Store them securely.
    *   **S3 Bucket Policy for Frontend Read Access:** Add a Bucket Policy to your S3 bucket that allows `s3:GetObject` permission to `"Principal": "*"` for the objects your frontend needs to read (e.g., `"Resource": "arn:aws:s3:::YOUR_S3_BUCKET_NAME/*"` or specific prefixes like `.../uploads/*`). This is required for your frontend running in the browser to fetch the CSV data directly from the S3 URL.
    *   **S3 Bucket CORS Policy:** Add a CORS policy to your S3 bucket allowing `GET` requests from your frontend's origin(s) (e.g., `http://localhost:3000`, your deployed Netlify/Render URL). This is crucial to avoid browser cross-origin errors when the frontend fetches the CSV from S3.

4.  **Create a `.env` file** in the `backend` directory and add your AWS credentials and S3 bucket name:

    ```env
    AWS_ACCESS_KEY_ID="YOUR_ACCESS_KEY_ID"
    AWS_SECRET_ACCESS_KEY="YOUR_SECRET_ACCESS_KEY"
    AWS_REGION="your-aws-region"
    S3_BUCKET_NAME="your-s3-bucket-name"
    ```
    Replace the placeholder values with your actual AWS configuration.

5.  Start the backend server:

    ```bash
    npm start
    ```
    The server should start on `http://localhost:3001` (or the port specified by the `PORT` environment variable).

### 2. Frontend Setup (React App)

1.  Navigate to the `filter-optimization` directory in your terminal:

    ```bash
    cd filter-optimization
    ```

2.  Install the necessary Node.js dependencies:

    ```bash
    npm install
    ```

3.  (Optional) If your backend is running on a different URL than `http://localhost:3001`, you can create a `.env` file in the `filter-optimization` directory and set the `REACT_APP_BACKEND_URL` variable:

    ```env
    REACT_APP_BACKEND_URL="http://localhost:3001"
    ```
    Replace the URL if your backend is hosted elsewhere.

4.  Start the frontend development server:

    ```bash
    npm start
    ```
    The frontend should open in your browser, usually at `http://localhost:3000`.

## Usage

1.  Ensure both the backend and frontend servers are running.
2.  Open the frontend application in your browser.
3.  Click the "Upload Dataset" button.
4.  Select a CSV file from your computer.
5.  The file will be uploaded to your S3 bucket via the backend.
6.  Once uploaded, the frontend will fetch the data from the S3 URL and display it in the table, enabling filtering.

Remember that data is not persisted beyond the current session unless you re-upload the file or implement a dataset listing feature (which would require further backend/frontend development).