DROP VIEW IF EXISTS driver_stats;

CREATE OR REPLACE VIEW driver_stats AS
SELECT 
    d.*,
    COALESCE(AVG(r.rating), 0) AS average_rating,
    COUNT(r.id) AS total_ratings
FROM drivers d
LEFT JOIN ratings r ON d.id = r.driver_id
GROUP BY d.id;
