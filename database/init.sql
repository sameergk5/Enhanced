-- Initialize Wardrobe AI Database
-- This script sets up the initial database structure and seed data

-- Create extensions
CREATE EXTENSION
IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION
IF NOT EXISTS "pgcrypto";

-- Create enums for better data consistency
CREATE TYPE user_gender AS ENUM
('male', 'female', 'non-binary', 'prefer-not-to-say');
CREATE TYPE garment_category AS ENUM
('top', 'bottom', 'dress', 'shoes', 'accessory', 'outerwear');
CREATE TYPE body_type AS ENUM
('slim', 'athletic', 'curvy', 'plus', 'petite', 'tall');
CREATE TYPE style_type AS ENUM
('casual', 'formal', 'boho', 'minimalist', 'vintage', 'streetwear', 'preppy', 'edgy');

-- Create indexes for better performance
CREATE INDEX CONCURRENTLY
IF NOT EXISTS idx_users_email ON users
(email);
CREATE INDEX CONCURRENTLY
IF NOT EXISTS idx_users_username ON users
(username);
CREATE INDEX CONCURRENTLY
IF NOT EXISTS idx_garments_user_category ON garments
(user_id, category);
CREATE INDEX CONCURRENTLY
IF NOT EXISTS idx_garments_color ON garments
(color);
CREATE INDEX CONCURRENTLY
IF NOT EXISTS idx_outfits_user_id ON outfits
(user_id);
CREATE INDEX CONCURRENTLY
IF NOT EXISTS idx_posts_user_id ON posts
(user_id);
CREATE INDEX CONCURRENTLY
IF NOT EXISTS idx_posts_created_at ON posts
(created_at DESC);
CREATE INDEX CONCURRENTLY
IF NOT EXISTS idx_likes_user_post ON likes
(user_id, post_id);
CREATE INDEX CONCURRENTLY
IF NOT EXISTS idx_follows_follower ON follows
(follower_id);
CREATE INDEX CONCURRENTLY
IF NOT EXISTS idx_follows_following ON follows
(following_id);

-- Insert sample style categories
INSERT INTO style_profiles
	(id, user_id, preferred_styles, preferred_colors, brand_prefs, price_range, lifestyle, occasions)
SELECT
	gen_random_uuid(),
	'00000000-0000-0000-0000-000000000000', -- Placeholder user
	ARRAY['casual', 'minimalist'],
	ARRAY['#000000', '#FFFFFF', '#808080'],
	ARRAY['Uniqlo', 'Zara', 'H&M'],
	'{"min": 0, "max": 200}',
	ARRAY['professional', 'social'],
	ARRAY['work', 'casual', 'weekend']
WHERE NOT EXISTS (SELECT 1
FROM style_profiles
WHERE user_id = '00000000-0000-0000-0000-000000000000');

-- Create sample garment categories data
CREATE TABLE
IF NOT EXISTS garment_categories
(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid
(),
    name VARCHAR
(50) NOT NULL,
    subcategories TEXT[] DEFAULT '{}',
    typical_colors TEXT[] DEFAULT '{}',
    seasonal_relevance TEXT[] DEFAULT '{}'
);

INSERT INTO garment_categories
	(name, subcategories, typical_colors, seasonal_relevance)
VALUES
	('top', ARRAY
['t-shirt', 'blouse', 'sweater', 'tank-top', 'hoodie', 'jacket'],
       ARRAY['white', 'black', 'navy', 'gray', 'red', 'blue'],
       ARRAY['spring', 'summer', 'fall', 'winter']),
('bottom', ARRAY['jeans', 'pants', 'shorts', 'skirt', 'leggings'],
          ARRAY['black', 'navy', 'khaki', 'denim', 'white'],
          ARRAY['spring', 'summer', 'fall', 'winter']),
('dress', ARRAY['casual', 'formal', 'midi', 'maxi', 'mini'],
         ARRAY['black', 'navy', 'floral', 'red', 'white'],
         ARRAY['spring', 'summer', 'fall']),
('shoes', ARRAY['sneakers', 'heels', 'flats', 'boots', 'sandals'],
         ARRAY['black', 'brown', 'white', 'nude', 'metallic'],
         ARRAY['spring', 'summer', 'fall', 'winter']),
('accessory', ARRAY['bag', 'jewelry', 'scarf', 'hat', 'belt'],
             ARRAY['black', 'brown', 'gold', 'silver', 'colorful'],
             ARRAY['spring', 'summer', 'fall', 'winter']),
('outerwear', ARRAY['coat', 'jacket', 'blazer', 'cardigan', 'vest'],
             ARRAY['black', 'navy', 'gray', 'brown', 'beige'],
             ARRAY['fall', 'winter', 'spring']);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column
()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers to update updated_at automatically
CREATE TRIGGER update_users_updated_at BEFORE
UPDATE ON users FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column
();
CREATE TRIGGER update_user_profiles_updated_at BEFORE
UPDATE ON user_profiles FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column
();
CREATE TRIGGER update_style_profiles_updated_at BEFORE
UPDATE ON style_profiles FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column
();
CREATE TRIGGER update_avatars_3d_updated_at BEFORE
UPDATE ON avatars_3d FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column
();
CREATE TRIGGER update_garments_updated_at BEFORE
UPDATE ON garments FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column
();
CREATE TRIGGER update_outfits_updated_at BEFORE
UPDATE ON outfits FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column
();
CREATE TRIGGER update_posts_updated_at BEFORE
UPDATE ON posts FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column
();
CREATE TRIGGER update_comments_updated_at BEFORE
UPDATE ON comments FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column
();

-- Create view for user stats
CREATE OR REPLACE VIEW user_stats AS
SELECT
	u.id as user_id,
	u.username,
	u.display_name,
	COUNT(DISTINCT g.id) as garment_count,
	COUNT(DISTINCT o.id) as outfit_count,
	COUNT(DISTINCT p.id) as post_count,
	COUNT(DISTINCT l.id) as like_count,
	COUNT(DISTINCT followers.id) as follower_count,
	COUNT(DISTINCT following.id) as following_count
FROM users u
	LEFT JOIN garments g ON u.id = g.user_id
	LEFT JOIN outfits o ON u.id = o.user_id
	LEFT JOIN posts p ON u.id = p.user_id
	LEFT JOIN likes l ON u.id = l.user_id
	LEFT JOIN follows followers ON u.id = followers.following_id
	LEFT JOIN follows following ON u.id = following.follower_id
GROUP BY u.id, u.username, u.display_name;

-- Create function for outfit recommendations based on weather/occasion
CREATE OR REPLACE FUNCTION get_outfit_recommendations
(
    user_id_param UUID,
    occasion_param TEXT DEFAULT NULL,
    weather_param TEXT DEFAULT NULL
)
RETURNS TABLE
(
    outfit_id UUID,
    outfit_name TEXT,
    garment_names TEXT[],
    categories TEXT[],
    colors TEXT[]
) AS $$
BEGIN
	RETURN QUERY
	SELECT
		o.id as outfit_id,
		o.name as outfit_name,
		ARRAY_AGG(g.name) as garment_names,
		ARRAY_AGG(g.category) as categories,
		ARRAY_AGG(g.color) as colors
	FROM outfits o
		JOIN outfit_items oi ON o.id = oi.outfit_id
		JOIN garments g ON oi.garment_id = g.id
	WHERE o.user_id = user_id_param
		AND (occasion_param IS NULL OR occasion_param = ANY(o.occasion)
	)
    AND
	(weather_param IS NULL OR weather_param = ANY
	(o.weather))
    GROUP BY o.id, o.name
    ORDER BY o.wear_count DESC, o.created_at DESC
    LIMIT 10;
END;
$$ LANGUAGE plpgsql;
