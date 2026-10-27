const mysql = require('mysql2/promise');

async function main() {
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'olms_user',
        password: 'N!th@2007',
        database: 'olms_db'
    });

    try {
        console.log("Enrolling all learners in seeded courses...");

        const [users] = await connection.execute('SELECT id FROM users WHERE role = "LEARNER"');
        console.log(`Found ${users.length} learners.`);

        const courseIds = [1, 2];

        for (const user of users) {
            for (const courseId of courseIds) {
                // Check if already enrolled
                const [enrollments] = await connection.execute(
                    'SELECT id FROM enrollments WHERE course_id = ? AND learner_id = ?',
                    [courseId, user.id]
                );

                if (enrollments.length === 0) {
                    await connection.execute(
                        `INSERT INTO enrollments (completion_date, enrollment_date, expiry_date, progress_percentage, status, course_id, learner_id, payment_id)
                        VALUES (NULL, NOW(), NULL, 0.00, ?, ?, ?, NULL);`,
                        ['ACTIVE', courseId, user.id]
                    );
                    console.log(`Enrolled user ${user.id} in course ${courseId}`);
                }
            }
        }

        console.log("Fix complete!");

    } catch (e) {
        console.error("Error during fix:", e);
    } finally {
        await connection.end();
    }
}

main().catch(console.error);
