#!/usr/bin/env python3
"""
Database Setup and Initialization Script for Wardrobe AI
This script sets up PostgreSQL, Redis, and MinIO for the application
"""

import os
import subprocess
import time
from typing import Any, Dict

import psycopg2
import redis
import requests


class DatabaseSetup:
    def __init__(self):
        self.postgres_config = {
            'host': 'localhost',
            'port': 5432,
            'database': 'wardrobe_ai',
            'user': 'wardrobe',
            'password': 'wardrobe123'
        }

        self.redis_config = {
            'host': 'localhost',
            'port': 6379,
            'db': 0
        }

        self.minio_config = {
            'endpoint': 'localhost:9000',
            'access_key': 'wardrobeadmin',
            'secret_key': 'wardrobe123'
        }

    def check_docker_running(self) -> bool:
        """Check if Docker is running"""
        try:
            result = subprocess.run(['docker', 'ps'],
                                  capture_output=True, text=True)
            return result.returncode == 0
        except FileNotFoundError:
            return False

    def start_database_services(self) -> bool:
        """Start database services using Docker Compose"""
        print("🐳 Starting database services with Docker Compose...")

        try:
            # Start only database services
            services = ['postgres', 'redis', 'minio']
            for service in services:
                print(f"Starting {service}...")
                result = subprocess.run([
                    'docker-compose', '-f', 'docker-compose.dev.yml',
                    'up', '-d', service
                ], capture_output=True, text=True)

                if result.returncode != 0:
                    print(f"❌ Failed to start {service}: {result.stderr}")
                    return False

                print(f"✅ {service} started successfully")

            # Wait for services to be ready
            print("⏳ Waiting for services to be ready...")
            time.sleep(10)

            return True

        except Exception as e:
            print(f"❌ Error starting services: {e}")
            return False

    def test_postgres_connection(self) -> bool:
        """Test PostgreSQL connection"""
        print("🔍 Testing PostgreSQL connection...")

        max_retries = 5
        for attempt in range(max_retries):
            try:
                conn = psycopg2.connect(**self.postgres_config)
                cursor = conn.cursor()

                # Test connection
                cursor.execute("SELECT version();")
                version = cursor.fetchone()
                print(f"✅ PostgreSQL connected: {version[0]}")

                # Check if tables exist
                cursor.execute("""
                    SELECT table_name
                    FROM information_schema.tables
                    WHERE table_schema = 'public'
                """)
                tables = cursor.fetchall()

                if tables:
                    print(f"✅ Found {len(tables)} tables in database")
                    for table in tables[:5]:  # Show first 5 tables
                        print(f"   - {table[0]}")
                else:
                    print("⚠️  No tables found - will need to run migrations")

                cursor.close()
                conn.close()
                return True

            except psycopg2.OperationalError as e:
                print(f"⏳ Attempt {attempt + 1}/{max_retries}: {e}")
                time.sleep(5)
            except Exception as e:
                print(f"❌ Error testing PostgreSQL: {e}")
                return False

        print("❌ Failed to connect to PostgreSQL after all retries")
        return False

    def test_redis_connection(self) -> bool:
        """Test Redis connection"""
        print("🔍 Testing Redis connection...")

        try:
            r = redis.Redis(**self.redis_config)

            # Test connection
            r.ping()
            print("✅ Redis connected successfully")

            # Test set/get
            r.set('test_key', 'wardrobe_ai_test')
            value = r.get('test_key')

            if value and value.decode() == 'wardrobe_ai_test':
                print("✅ Redis read/write test passed")
                r.delete('test_key')
                return True
            else:
                print("❌ Redis read/write test failed")
                return False

        except Exception as e:
            print(f"❌ Error testing Redis: {e}")
            return False

    def test_minio_connection(self) -> bool:
        """Test MinIO connection"""
        print("🔍 Testing MinIO connection...")

        try:
            # Test MinIO API endpoint
            response = requests.get(f"http://{self.minio_config['endpoint']}/minio/health/live")

            if response.status_code == 200:
                print("✅ MinIO is running and accessible")
                return True
            else:
                print(f"❌ MinIO health check failed: {response.status_code}")
                return False

        except Exception as e:
            print(f"❌ Error testing MinIO: {e}")
            return False

    def run_prisma_migrations(self) -> bool:
        """Run Prisma database migrations"""
        print("🗃️  Running Prisma migrations...")

        try:
            # Change to backend directory
            backend_dir = os.path.join(os.getcwd(), 'backend')

            # Generate Prisma client
            print("Generating Prisma client...")
            result = subprocess.run([
                'npx', 'prisma', 'generate'
            ], cwd=backend_dir, capture_output=True, text=True)

            if result.returncode != 0:
                print(f"❌ Failed to generate Prisma client: {result.stderr}")
                return False

            # Push database schema
            print("Pushing database schema...")
            result = subprocess.run([
                'npx', 'prisma', 'db', 'push'
            ], cwd=backend_dir, capture_output=True, text=True)

            if result.returncode != 0:
                print(f"❌ Failed to push database schema: {result.stderr}")
                return False

            print("✅ Prisma migrations completed successfully")
            return True

        except Exception as e:
            print(f"❌ Error running Prisma migrations: {e}")
            return False

    def create_seed_data(self) -> bool:
        """Create initial seed data"""
        print("🌱 Creating seed data...")

        try:
            conn = psycopg2.connect(**self.postgres_config)
            cursor = conn.cursor()

            # Create a test user
            cursor.execute("""
                INSERT INTO users (id, email, username, display_name, created_at, updated_at)
                VALUES (
                    gen_random_uuid(),
                    'test@wardrobeai.com',
                    'testuser',
                    'Test User',
                    NOW(),
                    NOW()
                ) ON CONFLICT (email) DO NOTHING;
            """)

            # Create sample garment categories
            sample_garments = [
                ('Blue Denim Jacket', 'outerwear', 'blue'),
                ('White Cotton T-Shirt', 'top', 'white'),
                ('Black Skinny Jeans', 'bottom', 'black'),
                ('Red Summer Dress', 'dress', 'red'),
                ('Brown Leather Boots', 'shoes', 'brown')
            ]

            for name, category, color in sample_garments:
                cursor.execute("""
                    INSERT INTO garments (id, user_id, name, category, color, created_at, updated_at)
                    SELECT
                        gen_random_uuid(),
                        u.id,
                        %s,
                        %s,
                        %s,
                        NOW(),
                        NOW()
                    FROM users u
                    WHERE u.email = 'test@wardrobeai.com'
                    AND NOT EXISTS (
                        SELECT 1 FROM garments g
                        WHERE g.name = %s AND g.user_id = u.id
                    );
                """, (name, category, color, name))

            conn.commit()
            cursor.close()
            conn.close()

            print("✅ Seed data created successfully")
            return True

        except Exception as e:
            print(f"❌ Error creating seed data: {e}")
            return False

    def setup_minio_buckets(self) -> bool:
        """Setup MinIO buckets for file storage"""
        print("🪣 Setting up MinIO buckets...")

        try:
            from minio import Minio

            client = Minio(
                self.minio_config['endpoint'],
                access_key=self.minio_config['access_key'],
                secret_key=self.minio_config['secret_key'],
                secure=False
            )

            # Create buckets
            buckets = ['avatars', 'garments', 'uploads', 'thumbnails']

            for bucket_name in buckets:
                if not client.bucket_exists(bucket_name):
                    client.make_bucket(bucket_name)
                    print(f"✅ Created bucket: {bucket_name}")
                else:
                    print(f"✅ Bucket already exists: {bucket_name}")

            return True

        except Exception as e:
            print(f"❌ Error setting up MinIO buckets: {e}")
            return False

    def run_setup(self) -> bool:
        """Run the complete database setup"""
        print("🚀 Starting Wardrobe AI Database Setup")
        print("=" * 50)

        # Check Docker
        if not self.check_docker_running():
            print("❌ Docker is not running. Please start Docker and try again.")
            return False

        # Start services
        if not self.start_database_services():
            return False

        # Test connections
        if not self.test_postgres_connection():
            return False

        if not self.test_redis_connection():
            return False

        if not self.test_minio_connection():
            return False

        # Run migrations
        if not self.run_prisma_migrations():
            return False

        # Create seed data
        if not self.create_seed_data():
            return False

        # Setup MinIO buckets
        if not self.setup_minio_buckets():
            return False

        print("\n" + "=" * 50)
        print("🎉 Database setup completed successfully!")
        print("\n📊 Database Services Status:")
        print("✅ PostgreSQL: Running on localhost:5432")
        print("✅ Redis: Running on localhost:6379")
        print("✅ MinIO: Running on localhost:9000")
        print("\n🔗 Access URLs:")
        print("🗄️  MinIO Console: http://localhost:9001")
        print("   Username: wardrobeadmin")
        print("   Password: wardrobe123")

        return True

if __name__ == "__main__":
    setup = DatabaseSetup()
    success = setup.run_setup()

    if not success:
        print("\n❌ Database setup failed. Please check the errors above.")
        exit(1)
    else:
        print("\n✅ Database is ready for development!")
        exit(0)
