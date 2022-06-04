const {
    client, 
    getAllUsers, 
    createUser, 
    updateUser, 
    createPost, 
    getAllPosts, 
    updatePost, 
    getUserById,
    getPostsByTagName,
} = require('./index');

async function testDB() {
  try {
        // connect the client to the database, finally
        console.log("Starting to test database...");

        // queries are promises, so we can await them
        const users = await getAllUsers();
        console.log("getAllUsers:", users);
        console.log("Calling updateUser on users[0]");
        const updateUserResult = await updateUser(users[0].id, {
            name: "Newname Sogood",
            location: "Lesterville, KY"
          });
        console.log("Result:", updateUserResult);
        // for now, logging is a fine way to see what's up

        console.log("Getting all posts");
        const posts = await getAllPosts();
        console.log("Result:", posts);

        console.log("Calling updatePost on posts[0]");
        const updatePostResult = await updatePost(posts[0].id, {
            title: "New Title",
            content: "Updated Content"
        });
        console.log("Result:", updatePostResult);

        console.log("Calling getUserById with 1");
        const albert = await getUserById(1);
        console.log("Result:", albert);

        console.log("Calling updatePost on posts[1], only updating tags");
        const updatePostTagsResult = await updatePost(posts[1].id, {
        tags: ["#youcandoanything", "#redfish", "#bluefish"]
        });
        console.log("Result:", updatePostTagsResult);

        console.log("Calling getPostsByTagName with #happy");
        const postsWithHappy = await getPostsByTagName("#happy");
        console.log("Result:", postsWithHappy);
        
        console.log("Finished database tests!");
  } catch (error) {
        console.error("Error testing database!");
        throw error;
  }
};

async function createInitialUsers() {
    try {
        console.log("Starting to create users...");
    
        const albert = await createUser({ username: 'albert', password: 'bertie99', name: "bert", location: "antarctica" });
        const sandra = await createUser({ username: 'sandra', password: '2sandy4me', name: "sand", location: "sahara desert"});
        const glamgal = await createUser({ username: 'glamgal', password: 'soglam', name: "ronald", location: "texas"});
    
        console.log("Finished creating users!");
    } catch(error) {
        console.error("Error creating users!");
        throw error;
    }
};

// this function should call a query which drops all tables from our database
async function dropTables() {
    try {
        console.log("Starting to drop tables...");
        await client.query(`
            DROP TABLE IF EXISTS post_tags;
            DROP TABLE IF EXISTS tags;
            DROP TABLE IF EXISTS posts;
            DROP TABLE IF EXISTS users;
        `);
        console.log("Finished dropping tables!");
    } catch (error) {
        console.error("Error dropping tables!");
        throw error; // we pass the error up to the function that calls dropTables
    }
};

// this function should call a query which creates all tables for our database 
async function createTables() {
    try {
        console.log("Starting to build tables...");
        await client.query(`
            CREATE TABLE users (
                id SERIAL PRIMARY KEY,
                username varchar(255) UNIQUE NOT NULL,
                password varchar(255) NOT NULL,
                name varchar(255) NOT NULL,
                location varchar(255) NOT NULL,
                active BOOLEAN DEFAULT TRUE
            );
        `);
        await client.query(`
            CREATE TABLE posts (
                id SERIAL PRIMARY KEY,
                "authorId" INTEGER REFERENCES users(id) NOT NULL,
                title varchar(255) NOT NULL,
                content TEXT NOT NULL,
                active BOOLEAN DEFAULT TRUE
            );
        `);
        await client.query(`
            CREATE TABLE tags (
                id SERIAL PRIMARY KEY,
                name varchar(255) UNIQUE NOT NULL
            );
        `);
        await client.query(`
            CREATE TABLE post_tags (
                "postId" INTEGER REFERENCES posts(id),
                "tagId" INTEGER REFERENCES tags(id),
                CONSTRAINT unique_constraint UNIQUE ("postId", "tagId")
            );
        `)
        console.log("Finished building tables!");
    } catch (error) {
        console.error("Error building tables!");
        throw error; // we pass the error up to the function that calls createTables
    }
};

async function rebuildDB() {
    try {
      client.connect();
  
      await dropTables();
      await createTables();
      await createInitialUsers();
      await createInitialPosts();
    } catch (error) {
      throw error;
    }
};

async function createInitialPosts() {
    try {
        const [albert, sandra, glamgal] = await getAllUsers();

        await createPost({
            authorId: albert.id,
            title: "First Post",
            content: "This is my first post. I hope I love writing blogs as much as I love writing them.",
            tags: ["#happy", "#bestdayever"]
        });

        await createPost({
            authorId: albert.id,
            title: "Second Post",
            content: "Wow second post so cool!",
            tags: ["#verycool", "#verynice"]
        });

        await createPost({
            authorId: sandra.id,
            title: "Second Post",
            content: "Second on this cool website",
            tags: ["#happy", "#worst-day-ever"]
        });

        await createPost({
            authorId: glamgal.id,
            title: "Third Post",
            content: "Third!!!",
            tags: ["#happy", "#youcandoanything", "#canmandoeverything"]
        });
    } catch (error) {
        throw error;
    }
};

rebuildDB()
    .then(testDB)
    .catch(console.error)
    .finally(() => client.end());