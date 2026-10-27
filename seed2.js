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
            ['Design', 'Introduction to UI/UX using modern tools.', 'BEGINNER', 5, 'English', 29.99, 4.5, 80, 'PUBLISHED', 'UI/UX Fundamentals', 240, 3]
        );
        const courseId = courseResult.insertId;
        console.log(`Created course with ID: ${courseId}`);

        // Insert module
        const [moduleResult] = await connection.execute(
            `INSERT INTO course_modules (description, order_index, is_published, release_date, title, course_id)
            VALUES (?, ?, ?, NOW(), ?, ?);`,
            ['Wireframing basic concepts', 1, 1, 'Wireframing 101', courseId]
        );
        const moduleId = moduleResult.insertId;
        console.log(`Created module with ID: ${moduleId}`);

        // Insert lesson
        await connection.execute(
            `INSERT INTO lessons (content_url, duration_seconds, is_free, lesson_type, order_index, is_published, title, module_id)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
            ['https://example.com/video2.mp4', 500, 1, 'VIDEO', 1, 1, 'Figma basics', moduleId]
        );

        // Insert assessment (Quiz)
        const [assessmentResult] = await connection.execute(
            `INSERT INTO assessments (assessment_type, max_attempts, passing_score, is_randomized, time_limit_minutes, title, course_id, module_id)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
            ['QUIZ', 2, 80.0, 1, 30, 'Design Principles Quiz', courseId, moduleId]
        );
        console.log(`Created assessment with ID: ${assessmentResult.insertId}`);

        // Insert enrollment for user 1 (Nithya)
        await connection.execute(
            `INSERT INTO enrollments (completion_date, enrollment_date, expiry_date, progress_percentage, status, course_id, learner_id, payment_id)
            VALUES (NULL, NOW(), NULL, 15.00, ?, ?, ?, NULL);`,
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
