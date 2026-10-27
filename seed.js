const mysql = require('mysql2/promise');

async function main() {
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'olms_user',
        password: 'N!th@2007',
        database: 'olms_db'
    });

    try {
        console.log("Seeding data...");

        // Insert course
        const [courseResult] = await connection.execute(
            `INSERT INTO courses (category, created_date, description, difficulty_level, enrollment_count, language, price, published_date, rating_average, rating_count, status, title, total_duration_minutes, instructor_id)
            VALUES (?, NOW(), ?, ?, ?, ?, ?, NOW(), ?, ?, ?, ?, ?, ?);`,
            ['Technology', 'Learn to build scalable applications with Spring Boot.', 'BEGINNER', 1, 'English', 0.00, 4.8, 120, 'PUBLISHED', 'Mastering Spring Boot', 300, 2]
        );
        const courseId = courseResult.insertId;
        console.log(`Created course with ID: ${courseId}`);

        // Insert module
        const [moduleResult] = await connection.execute(
            `INSERT INTO course_modules (description, order_index, is_published, release_date, title, course_id)
            VALUES (?, ?, ?, NOW(), ?, ?);`,
            ['Introduction to core concepts', 1, 1, 'Getting Started', courseId]
        );
        const moduleId = moduleResult.insertId;
        console.log(`Created module with ID: ${moduleId}`);

        // Insert lesson
        await connection.execute(
            `INSERT INTO lessons (content_url, duration_seconds, is_free, lesson_type, order_index, is_published, title, module_id)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
            ['https://example.com/video1.mp4', 600, 1, 'VIDEO', 1, 1, 'What is Spring Boot?', moduleId]
        );

        // Insert assessment (Assignment)
        const [assessmentResult] = await connection.execute(
            `INSERT INTO assessments (assessment_type, max_attempts, passing_score, is_randomized, time_limit_minutes, title, course_id, module_id)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
            ['ASSIGNMENT', 3, 70.0, 0, 120, 'Build a simple REST API', courseId, moduleId]
        );
        console.log(`Created assignment with ID: ${assessmentResult.insertId}`);

        // Insert enrollment for user 1 (Nithya)
        await connection.execute(
            `INSERT INTO enrollments (completion_date, enrollment_date, expiry_date, progress_percentage, status, course_id, learner_id, payment_id)
            VALUES (NULL, NOW(), NULL, 0.00, ?, ?, ?, NULL);`,
            ['ACTIVE', courseId, 1]
        );
        console.log(`Enrolled user 1 in course ${courseId}`);

        console.log("Seeding complete!");

    } catch (e) {
        console.error("Error during seeding:", e);
    } finally {
        await connection.end();
    }
}

main().catch(console.error);
