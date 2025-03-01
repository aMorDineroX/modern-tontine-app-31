# Tontine App

## Project Setup

### Prerequisites
- Node.js (v18+ recommended)
- npm or yarn

### Installation Steps

1. Clone the repository
```bash
git clone https://github.com/your-username/tontine-app.git
cd tontine-app
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
```bash
npm run env:setup
```
This script will guide you through setting up your `.env` file with Supabase credentials.

### Environment Variables
Create a `.env` file with the following variables:
- `VITE_SUPABASE_URL`: Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Your Supabase anonymous key

### Running the Application

- Development mode:
```bash
npm run dev
```

- Build for production:
```bash
npm run build
```

### Troubleshooting

#### Signup Issues
If you encounter signup problems:
1. Check your Supabase project configuration
2. Verify email settings
3. Check RLS (Row Level Security) policies
4. Ensure all required fields are present

#### Database Connection
- Verify your database credentials
- Check network connectivity
- Ensure you have the correct permissions

## Contributing
Please read CONTRIBUTING.md for details on our code of conduct and the process for submitting pull requests.

## License
This project is licensed under the MIT License - see the LICENSE.md file for details.