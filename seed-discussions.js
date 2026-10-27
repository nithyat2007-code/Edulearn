const mysql = require('mysql2/promise');

async function main() {
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'olms_user',
        password: 'N!th@2007',
        database: 'olms_db'
    });

    try {
        console.log("Seeding discussions...");

        // Get the first user (learner)
        const [users] = await connection.execute('SELECT id FROM users LIMIT 1');
        if (users.length === 0) {
            console.log("No users found to author discussions.");
            return;
        }
        const userId = users[0].id;
        
        // Get courses
        const [courses] = await connection.execute('SELECT id, title FROM courses LIMIT 3');
        if (courses.length === 0) {
            console.log("No courses found.");
            return;
        }
        
        // Drop legacy columns that are no longer in the entity
        try {
            await connection.execute('ALTER TABLE discussions DROP COLUMN locked;');
        } catch(e) {}
        try {
            await connection.execute('ALTER TABLE discussions DROP COLUMN message;');
        } catch(e) {}
        try {
            await connection.execute('ALTER TABLE discussions DROP COLUMN pinned;');
        } catch(e) {}
        try {
            await connection.execute('ALTER TABLE discussions DROP FOREIGN KEY FK9poj0fwjbqjit2n9dt6bhe5f7;');
        } catch(e) {}
        try {
            await connection.execute('ALTER TABLE discussions DROP COLUMN user_id;');
        } catch(e) {}

        for (const course of courses) {
            // Insert a root discussion thread
            const [rootResult] = await connection.execute(
                `INSERT INTO discussions (content, created_at, is_resolved, title, upvotes, author_id, course_id, parent_id)
                VALUES (?, NOW(), ?, ?, ?, ?, ?, NULL);`,
                [
                    `I have a question about the recent lesson in ${course.title}. Can anyone explain how the core concepts apply to real-world scenarios? It would be great to see some practical examples.`, 
                    0, 
                    'Understanding the basics in practice', 
                    5, 
                    userId, 
                    course.id
                ]
            );
            const rootId = rootResult.insertId;
            
            // Insert a reply
            await connection.execute(
                `INSERT INTO discussions (content, created_at, is_resolved, title, upvotes, author_id, course_id, parent_id)
                VALUES (?, NOW(), ?, ?, ?, ?, ?, ?);`,
                [
                    `That's a great question! In practice, you'll use these concepts every day to build modular and maintainable systems. I suggest checking out the supplementary reading materials.`, 
                    0, 
                    'Re: Understanding the basics in practice', 
                    2, 
                    userId, 
                    course.id, 
                    rootId
                ]
            );
            
            console.log(`Created discussion thread for course: ${course.title}`);
        }

        console.log("Discussion seeding complete!");

    } catch (e) {
        console.error("Error during seeding:", e);
    } finally {
        await connection.end();
    }
}

main().catch(console.error);
