const zod = require('zod');

// Creating Schema for User inputs to verify the data.
const userSchema = zod.object({
    name: zod.string().min(3),
    username: zod.string().min(3),
    email: zod.string().email(),
    password: zod.string().min(6)
});
function validateUser(name, username, email, password) {
    const result = userSchema.safeParse({ name, username, email, password });
    if (!result.success) console.log(result.error);
    return result.success;
}

module.exports = {
    validateUser
}