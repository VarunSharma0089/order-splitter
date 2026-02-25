npm install
cp .env.example .env        # then fill in your API_KEY
npm run start:dev           # development with hot reload
npm run build && npm start  # production build

# Change decimal precision
SHARE_DECIMAL_PLACES=7 npm run start:dev
