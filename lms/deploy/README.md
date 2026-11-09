# Deploying to the shared EC2 instance (temporary)

The instance also runs the TurnIt portfolio (nginx site `tai_portfolio`, systemd `pfolioapi` on :8001,
native Postgres on 127.0.0.1:5432). The LMS is kept separate from it:

| | Portfolio | LMS |
|---|---|---|
| nginx site | `tai_portfolio` | `learnwithsateesh` (new file, never edit the other) |
| API | systemd, :8001 | docker, 127.0.0.1:8000 |
| Database | host Postgres :5432 | its own container, no published port |
| Static files | `/home/ubuntu/projects/...` | `/var/www/lws/dist` |

## One-time setup

1. **DNS** (at the domain's DNS host): `A learnwithsateesh.in -> <instance public IP>`, `A www -> same IP`.
   Use an Elastic IP so the address survives a stop/start. Wait until `dig +short learnwithsateesh.in` shows it.
2. Security group: 80 and 443 open to the world; SSH only from your IP.
3. On the server:

       git clone https://github.com/satishtvs/learnwithsateesh.git ~/projects/learnwithsateesh
       cd ~/projects/learnwithsateesh/lms
       cp .env.example .env && nano .env     # see "Production .env" below
       sudo cp deploy/nginx-learnwithsateesh.conf /etc/nginx/sites-available/learnwithsateesh
       sudo ln -s /etc/nginx/sites-available/learnwithsateesh /etc/nginx/sites-enabled/
       sudo nginx -t && sudo systemctl reload nginx      # never reload if -t fails
       bash deploy/deploy.sh
       sudo certbot --nginx -d learnwithsateesh.in -d www.learnwithsateesh.in --redirect
       (crontab -l; echo '17 2 * * * /home/ubuntu/projects/learnwithsateesh/lms/deploy/backup.sh >> /var/backups/lws/backup.log 2>&1') | crontab -

## Production .env

    POSTGRES_PASSWORD=<openssl rand -hex 24>      # hex only: it is embedded in a URL
    SECRET=<openssl rand -hex 32>
    FRONTEND_URL=https://learnwithsateesh.in
    PUBLIC_URL=https://learnwithsateesh.in
    CORS_ORIGINS=["https://learnwithsateesh.in"]
    COOKIE_SECURE=true
    REQUIRE_VERIFIED_EMAIL=false                  # set true once real email sending exists
    GOOGLE_CLIENT_ID= / GOOGLE_CLIENT_SECRET=     # redirect URI: https://learnwithsateesh.in/api/auth/google/callback

## Updating

    ssh ubuntu@<host> 'bash ~/projects/learnwithsateesh/lms/deploy/deploy.sh'

## Rollback / removal

    docker compose -f docker-compose.prod.yml down          # keeps data (volume pgdata)
    sudo rm /etc/nginx/sites-enabled/learnwithsateesh && sudo nginx -t && sudo systemctl reload nginx

The portfolio is untouched by either.
