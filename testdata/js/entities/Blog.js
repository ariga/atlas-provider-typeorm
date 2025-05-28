const {EntitySchema} = require("typeorm");
const BlogOptions = {
    name: 'Blog',
    columns: {
        id: {
            primary: true,
            type: 'int',
            generated: true
        },
    },
}
const Blog = new EntitySchema(BlogOptions);
const Author = new EntitySchema(require("./blog/Author"));
module.exports={Blog, Author}