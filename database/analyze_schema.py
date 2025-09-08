#!/usr/bin/env python3
"""
Database Schema Verification and Documentation
Validates the Prisma schema and generates database documentation
"""

import json
import os
from typing import Any, Dict, List


class DatabaseSchemaAnalyzer:
    def __init__(self):
        self.schema_path = os.path.join(os.path.dirname(__file__), '..', 'backend', 'prisma', 'schema.prisma')
        self.models = {}
        self.enums = {}

    def parse_schema(self) -> bool:
        """Parse the Prisma schema file"""
        try:
            with open(self.schema_path, 'r', encoding='utf-8') as f:
                content = f.read()

            # Extract models and enums
            lines = content.split('\n')
            current_model = None
            current_type = None

            for line in lines:
                line = line.strip()

                # Model definitions
                if line.startswith('model '):
                    current_model = line.split()[1]
                    current_type = 'model'
                    self.models[current_model] = {
                        'fields': [],
                        'relations': [],
                        'indexes': []
                    }

                # Enum definitions
                elif line.startswith('enum '):
                    current_model = line.split()[1]
                    current_type = 'enum'
                    self.enums[current_model] = []

                # Field definitions
                elif current_type == 'model' and current_model and line and not line.startswith('//') and not line.startswith('}'):
                    if '@@' not in line:  # Skip model-level directives
                        self.models[current_model]['fields'].append(line)

                # Enum values
                elif current_type == 'enum' and current_model and line and not line.startswith('//') and not line.startswith('}'):
                    self.enums[current_model].append(line)

                # Reset on closing brace
                elif line == '}':
                    current_model = None
                    current_type = None

            return True

        except FileNotFoundError:
            print(f"❌ Schema file not found: {self.schema_path}")
            return False
        except Exception as e:
            print(f"❌ Error parsing schema: {e}")
            return False

    def analyze_models(self) -> Dict[str, Any]:
        """Analyze the database models"""
        analysis = {
            'total_models': len(self.models),
            'total_enums': len(self.enums),
            'core_models': [],
            'feature_models': {},
            'relationships': []
        }

        # Categorize models
        core_models = ['User', 'UserProfile', 'StyleProfile']
        avatar_models = ['Avatar3D']
        wardrobe_models = ['Garment', 'Outfit', 'OutfitItem']
        social_models = ['Post', 'Like', 'Comment', 'Follow']
        ai_models = ['AIRecommendation', 'StyleAnalysis']

        for model_name in self.models:
            if model_name in core_models:
                analysis['core_models'].append(model_name)
            elif model_name in avatar_models:
                if 'Avatar System' not in analysis['feature_models']:
                    analysis['feature_models']['Avatar System'] = []
                analysis['feature_models']['Avatar System'].append(model_name)
            elif model_name in wardrobe_models:
                if 'Wardrobe Management' not in analysis['feature_models']:
                    analysis['feature_models']['Wardrobe Management'] = []
                analysis['feature_models']['Wardrobe Management'].append(model_name)
            elif model_name in social_models:
                if 'Social Features' not in analysis['feature_models']:
                    analysis['feature_models']['Social Features'] = []
                analysis['feature_models']['Social Features'].append(model_name)
            elif model_name in ai_models:
                if 'AI Services' not in analysis['feature_models']:
                    analysis['feature_models']['AI Services'] = []
                analysis['feature_models']['AI Services'].append(model_name)
            else:
                if 'Other' not in analysis['feature_models']:
                    analysis['feature_models']['Other'] = []
                analysis['feature_models']['Other'].append(model_name)

        return analysis

    def generate_documentation(self) -> str:
        """Generate comprehensive database documentation"""
        doc = []
        doc.append("# Wardrobe AI Database Schema Documentation")
        doc.append("=" * 50)
        doc.append("")

        analysis = self.analyze_models()

        # Overview
        doc.append("## 📊 Database Overview")
        doc.append("")
        doc.append(f"- **Total Models**: {analysis['total_models']}")
        doc.append(f"- **Total Enums**: {analysis['total_enums']}")
        doc.append(f"- **Core Models**: {len(analysis['core_models'])}")
        doc.append(f"- **Feature Categories**: {len(analysis['feature_models'])}")
        doc.append("")

        # Core Models
        doc.append("## 👤 Core User Models")
        doc.append("")
        for model in analysis['core_models']:
            doc.append(f"### {model}")
            doc.append("```sql")
            for field in self.models[model]['fields'][:10]:  # Show first 10 fields
                doc.append(f"  {field}")
            if len(self.models[model]['fields']) > 10:
                doc.append(f"  ... (+{len(self.models[model]['fields']) - 10} more fields)")
            doc.append("```")
            doc.append("")

        # Feature Models
        doc.append("## 🎯 Feature Models by Category")
        doc.append("")
        for category, models in analysis['feature_models'].items():
            doc.append(f"### {category}")
            for model in models:
                doc.append(f"- **{model}**: {len(self.models[model]['fields'])} fields")
            doc.append("")

        # Enums
        if self.enums:
            doc.append("## 📝 Enum Types")
            doc.append("")
            for enum_name, values in self.enums.items():
                doc.append(f"### {enum_name}")
                doc.append("```")
                for value in values:
                    doc.append(f"  {value}")
                doc.append("```")
                doc.append("")

        return "\n".join(doc)

    def validate_schema(self) -> List[str]:
        """Validate the database schema for common issues"""
        issues = []

        # Check for required core models
        required_models = ['User', 'UserProfile', 'Garment', 'Avatar3D']
        for model in required_models:
            if model not in self.models:
                issues.append(f"Missing required model: {model}")

        # Check for proper relationships
        user_model = self.models.get('User', {})
        user_fields = user_model.get('fields', [])

        # Check if User model has required fields
        required_user_fields = ['id', 'email', 'username']
        for field in required_user_fields:
            if not any(field in f for f in user_fields):
                issues.append(f"User model missing required field: {field}")

        # Check for proper indexing (basic check)
        if 'User' in self.models:
            user_fields = self.models['User']['fields']
            has_email_unique = any('@unique' in f and 'email' in f for f in user_fields)
            if not has_email_unique:
                issues.append("User email field should have @unique constraint")

        return issues

    def run_analysis(self) -> bool:
        """Run the complete schema analysis"""
        print("🔍 Analyzing Wardrobe AI Database Schema")
        print("=" * 45)

        # Parse schema
        if not self.parse_schema():
            return False

        print(f"✅ Parsed schema file: {os.path.basename(self.schema_path)}")

        # Analyze models
        analysis = self.analyze_models()

        # Display analysis
        print(f"\n📊 Schema Analysis:")
        print(f"   📋 Total Models: {analysis['total_models']}")
        print(f"   🏷️  Total Enums: {analysis['total_enums']}")
        print(f"   👤 Core Models: {len(analysis['core_models'])}")

        print(f"\n🎯 Feature Categories:")
        for category, models in analysis['feature_models'].items():
            print(f"   {category}: {len(models)} models")

        # Validate schema
        issues = self.validate_schema()
        if issues:
            print(f"\n⚠️  Schema Issues Found:")
            for issue in issues:
                print(f"   - {issue}")
        else:
            print(f"\n✅ Schema validation passed")

        # Generate documentation
        doc = self.generate_documentation()
        doc_path = os.path.join(os.path.dirname(__file__), 'DATABASE_SCHEMA.md')

        try:
            with open(doc_path, 'w', encoding='utf-8') as f:
                f.write(doc)
            print(f"\n📖 Documentation generated: {os.path.basename(doc_path)}")
        except Exception as e:
            print(f"\n❌ Failed to generate documentation: {e}")

        # Export schema summary
        summary = {
            'analysis': analysis,
            'models': {name: len(fields['fields']) for name, fields in self.models.items()},
            'enums': {name: len(values) for name, values in self.enums.items()},
            'issues': issues
        }

        summary_path = os.path.join(os.path.dirname(__file__), 'schema_summary.json')
        try:
            with open(summary_path, 'w', encoding='utf-8') as f:
                json.dump(summary, f, indent=2)
            print(f"📄 Schema summary exported: {os.path.basename(summary_path)}")
        except Exception as e:
            print(f"❌ Failed to export summary: {e}")

        print(f"\n🎉 Database schema analysis completed!")
        return True

if __name__ == "__main__":
    analyzer = DatabaseSchemaAnalyzer()
    success = analyzer.run_analysis()

    if not success:
        exit(1)
    else:
        exit(0)
