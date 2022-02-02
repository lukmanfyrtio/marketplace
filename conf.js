const conf = {
  port: 80, // dev
  // port: 7222, // local
  db: {
    host: 'mpdbv1', // dev
    port: '3306', // dev
    // host: 'localhost', // local
    // port: '8888', // local
    database: 'mpapi',
    user:'mpdb',
    password: 'Aku4@kua',
    connectionLimit: 10
    // connectTimeout: 60000,
    // acquireTimeout: 60000,
    // allowPublicKeyRetrieval: true
  }
}

const env = {
  env: 'dev'
}

module.exports = {conf, env}
