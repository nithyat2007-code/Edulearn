const mysql = require('mysql2/promise');

const mapping = [
    { title: 'Intro to Java', videoId: 'xTtL8E4LzTQ' },
    { title: 'Python for Beginners', videoId: 'ix9cRaBkVe0' },
    { title: 'React JS Complete Guide', videoId: 'CgkZ7MvWUAA' },
    { title: 'AWS Cloud Computing', videoId: 'k1RI5locZE4' },
    { title: 'Spring Boot Microservices', videoId: 'Jl9OKQ92SJU' },
    { title: 'Data Structures & Algorithms', videoId: 'B31LgI4Y4DQ' },
    { title: 'Full Stack', videoId: 'LzMnsfqjzkA' },
    { title: 'Machine Learning Fundamentals', videoId: 'GwIo3gDZCVQ' },
    { title: 'Cyber Security Basics', videoId: 'njPY7pQTRWg' },
    { title: 'Database Management Systems', videoId: '6Iu45VZGQDk' },
    { title: 'Distributed Computing Principles', videoId: '7VbL89mKK3M' },
    { title: 'Advanced DevOps', videoId: 'H5FAxTBuNM8' }
];

async function main() {
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'olms_user',
        password: 'N!th@2007',
        database: 'olms_db'
    });

    try {
        for (const map of mapping) {
            const embedUrl = `https://www.youtube.com/embed/${map.videoId}`;
            
            // We use a subquery to find all modules for courses matching the title
            const query = `
                UPDATE lessons 
                SET content_url = ? 
                WHERE module_id IN (
                    SELECT m.id FROM course_modules m
                    JOIN courses c ON m.course_id = c.id
                    WHERE c.title LIKE ?
                ) AND lesson_type = 'VIDEO';
            `;
            
            const [result] = await connection.execute(query, [embedUrl, `%${map.title}%`]);
            console.log(`Updated course '${map.title}' - ${result.affectedRows} lessons updated to ${embedUrl}`);
        }
        console.log("Finished updating all course videos!");
    } catch (e) {
        console.error(e);
    } finally {
        await connection.end();
    }
}

main().catch(console.error);
