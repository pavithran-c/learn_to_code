# MongoDB Atlas Setup Instructions

## Step 1: Create MongoDB Atlas Account
1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Sign up for a free account or sign in
3. Create a new project called "learn_to_code"

## Step 2: Create a Cluster
1. Click "Build a Database"
2. Choose "FREE" tier (M0 Sandbox)
3. Select your preferred cloud provider and region
4. Name your cluster (e.g., "Cluster0")
5. Click "Create Cluster"

## Step 3: Create Database User
1. In the left sidebar, click "Database Access"
2. Click "Add New Database User"
3. Choose "Password" authentication
4. Username: `learn_to_code_user`
5. Password: Generate a strong password (save it!)
6. Database User Privileges: "Read and write to any database"
7. Click "Add User"

## Step 4: Configure Network Access
1. In the left sidebar, click "Network Access"
2. Click "Add IP Address"
3. For development, click "Allow Access from Anywhere" (0.0.0.0/0)
4. For production, add only your specific IP addresses
5. Click "Confirm"

## Step 5: Get Connection String
1. Go to "Databases" in the left sidebar
2. Click "Connect" on your cluster
3. Choose "Connect your application"
4. Select "Python" as driver and latest version
5. Copy the connection string

## Step 6: Update Environment Variables
1. Open `Backend/.env` file
2. Replace the MONGODB_URI with your connection string:
   ```
   MONGODB_URI=mongodb+srv://learn_to_code_user:<password>@cluster0.xxxxx.mongodb.net/learn_to_code?retryWrites=true&w=majority
   ```
3. Replace `<password>` with your actual database user password
4. Replace the cluster URL with your actual cluster URL

## Example .env file:
```
MONGODB_URI=mongodb+srv://learn_to_code_user:MySecurePassword123@cluster0.abc123.mongodb.net/learn_to_code?retryWrites=true&w=majority
MONGODB_DATABASE=learn_to_code
```

## Database Collections Created Automatically:
- `evaluations`: Stores all code submission evaluations
- `user_progress`: Tracks user's problem-solving progress
- Indexes are created automatically for optimal performance

## Testing Connection:
1. Start your Flask backend: `python app.py`
2. Look for "Successfully connected to MongoDB Atlas" message
3. Submit a coding problem to test database storage

## Security Notes:
- Never commit your .env file to version control
- Use strong passwords for database users
- Restrict IP access for production environments
- Enable MongoDB Atlas monitoring and alerts
