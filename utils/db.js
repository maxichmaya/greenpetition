var spicedPg = require("spiced-pg");

if (process.env.DATABASE_URL) {
    db = spicedPg(process.env.DATABASE_URL);
} else {
    var db = spicedPg("postgres:postgres:curry@localhost:5432/petition");
}
//register a signature
exports.signaturePhoto = function signaturePhoto(signature, user_id) {
    console.log("signature, user_id:", signature, user_id);
    return db.query(
        `INSERT INTO users (
            signature,
            user_id)
            VALUES($1, $2)
            RETURNING id`,
        [signature, user_id]
    );
};

// register a user
exports.signersName = function signersName(name, surname, email, password) {
    return db.query(
        `INSERT INTO registers (
        name,
        surname,
        email,
        password)
        VALUES ($1, $2, $3, $4)
        RETURNING id`,
        [name, surname, email, password]
    );
};

//funckija za unos email-a i login i provjeru da li ima potpis
exports.loginEmail = function loginEmail(email) {
    return db.query(
        `SELECT email, password, id FROM registers WHERE email = $1`,
        [email]
    );
};

exports.checkIfSignture = function checkIfSignture(id) {
    return db.query(
        `SELECT signature FROM registers FULL OUTER JOIN users ON registers.id = users.user_id WHERE registers.id = $1`,
        [id]
    );
};
// //funkcija za provjeriti jesu li potpisali nakon login
// exports.checkSignature = function checkSignature() {
//     return db.query(
//         `SELECT email, password, signature FROM registers FULL OUTER JOIN users ON registers.id = user_profile.user_id `
//     );
// };

// funkcija for more profile details
exports.profileInfo = function profileInfo(age, city, url, user_id) {
    return db.query(
        `INSERT INTO user_profile (
            age,
            city,
            url,
            user_id) VALUES ($1, $2, $3, $4)
            RETURNING id`,
        [age, city, url, user_id]
    );
};

// funkcija za prikazivanje broja korisnika na graditute page
exports.NumOfSigners = function NumOfSigners() {
    return db.query(`SELECT COUNT(*) FROM registers`);
};

// funkcija za prikazivanje popisa korisnika na zadnjoj stranici
exports.getUsers = function getUsers() {
    return db.query(
        `SELECT name, surname, age, city, url FROM registers INNER JOIN user_profile ON registers.id = user_profile.user_id`
    );
};

// funkcija za prikaz grada
exports.getCity = function getCity(city) {
    return db.query(
        `SELECT name, surname, age, city FROM registers FULL OUTER JOIN user_profile ON registers.id = user_profile.user_id INNER JOIN users ON registers.id = users.user_id WHERE LOWER (city) = LOWER($1)`,
        [city]
    );
};
// funkcija za prikazivanje slike potpisa
exports.getImage = function getImage(id) {
    return db.query("SELECT signature FROM users WHERE user_id = $1", [id]);
};

// --------------------------------------------------------------
// -----------------------EDIT QUERIES---------------------

exports.editData = function editData(id) {
    return db.query(
        `SELECT name, surname, email, age, city, url
    FROM user_profile
    LEFT JOIN registers
    ON registers.id = user_profile.user_id
    WHERE registers.id = $1`,
        [id]
    );
};

exports.editUserWithPassword = function editUserWithPassword(
    name,
    surname,
    email,
    password,
    id
) {
    return db.query(
        `UPDATE registers
    SET name = $1, surname = $2, email= $3 , password = $4
    WHERE id = $5`,
        [name, surname, email, password, id]
    );
};

exports.editUserWithoutPassword = function editUserWithoutPassword(
    name,
    surname,
    email,
    id
) {
    return db.query(
        `UPDATE registers
    SET name = $1, surname = $2, email= $3
    WHERE id = $4`,
        [name, surname, email, id]
    );
};

exports.editUserProfile = function editUserProfile(age, city, url, user_id) {
    return db.query(
        `INSERT INTO user_profile(age, city, url, user_id)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (user_id)
        DO UPDATE SET age = $1, city = $2, url = $3, user_id = $4`,
        [age, city, url, user_id]
    );
};
