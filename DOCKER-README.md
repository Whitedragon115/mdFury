# Docker Setup for mdFury

This directory contains Docker configuration files for running mdFury in containerized environments.

## Quick Start

1. **Copy environment template**:
   ```bash
   copy .env.example .env
   ```

2. **Configure your environment variables** in `.env` file:
   - Set your database connection string
   - Configure NextAuth secrets
   - Add OAuth credentials (optional)
   - Set application settings

3. **Start the application**:
   ```bash
   # Production environment
   docker-start.bat
   
   # Development environment (with hot reload)
   docker-dev.bat
   ```

## Environment Variables

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | MySQL connection string | `mysql://user:pass@host:3306/db` |
| `NEXTAUTH_SECRET` | NextAuth session secret | Generate with: `openssl rand -base64 32` |
| `JWT_SECRET` | JWT signing secret | Same as NEXTAUTH_SECRET |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXTAUTH_URL` | Application URL | `http://localhost:3000` |
| `PUBLIC_MODE` | Allow anonymous usage | `true` |
| `DISABLE_REGISTRATION` | Disable user registration | `false` |
| `DISABLE_OAUTH_REGISTRATION` | Disable OAuth registration | `false` |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | - |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | - |
| `GITHUB_CLIENT_ID` | GitHub OAuth client ID | - |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth client secret | - |
| `INVITE_KEY` | Admin key for invite system | - |

## File Structure

```
├── docker-compose.yml          # Production configuration
├── docker-compose.dev.yml      # Development configuration
├── Dockerfile                  # Production build
├── Dockerfile.dev             # Development build
├── .dockerignore              # Docker build context exclusions
├── docker-start.bat           # Production startup script
├── docker-dev.bat             # Development startup script
└── .env.example               # Environment variables template
```

## Port Configuration

- **Production**: `http://localhost:4682` (mapped to container port 3000)
- **Development**: `http://localhost:3000` (mapped to container port 3000)

## Docker Commands

### Production Environment

```bash
# Build and start
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Rebuild
docker-compose build --no-cache
```

### Development Environment

```bash
# Build and start with hot reload
docker-compose -f docker-compose.dev.yml up

# Run in background
docker-compose -f docker-compose.dev.yml up -d

# Stop services
docker-compose -f docker-compose.dev.yml down
```

### Database Operations

```bash
# Run migrations
docker-compose run --rm mdfury-app npx prisma migrate deploy

# Generate Prisma client
docker-compose run --rm mdfury-app npx prisma generate

# Reset database (development only)
docker-compose run --rm mdfury-app npx prisma migrate reset
```

## Volumes

- `./uploads` - Persistent storage for uploaded files
- `./logs` - Application logs
- Development: Source code is mounted for hot reload

## Health Checks

The production container includes health checks that monitor:
- Application responsiveness
- API endpoint availability
- Container health status

Check health status:
```bash
docker-compose ps
```

## Troubleshooting

### Common Issues

1. **Port already in use**:
   - Change port mapping in docker-compose.yml
   - Kill process using the port: `netstat -ano | findstr :4682`

2. **Database connection failed**:
   - Verify DATABASE_URL in .env
   - Ensure database server is accessible
   - Check firewall settings

3. **Build failures**:
   - Clear Docker cache: `docker system prune -a`
   - Check .dockerignore excludes
   - Verify Node.js version compatibility

4. **Environment variables not loaded**:
   - Ensure .env file exists
   - Check variable names match exactly
   - Restart containers after .env changes

### Logs and Debugging

```bash
# View application logs
docker-compose logs -f mdfury-app

# View build logs
docker-compose build --no-cache --progress=plain

# Interactive container shell
docker-compose exec mdfury-app sh

# Check environment variables
docker-compose exec mdfury-app env
```

## Security Notes

- Never commit `.env` file to version control
- Use strong, unique secrets for production
- Regularly update base Docker images
- Monitor container security vulnerabilities

## Production Deployment

For production deployment:

1. Use proper domain name in `NEXTAUTH_URL`
2. Set secure database credentials
3. Configure OAuth redirect URIs
4. Use Docker Swarm or Kubernetes for orchestration
5. Set up proper logging and monitoring
6. Configure reverse proxy (nginx/traefik) for SSL termination
