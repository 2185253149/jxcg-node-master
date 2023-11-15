module.exports = {
  port: 3001,
  router: {
    default: './admin/H5',
    //www:{html:'./www'},
    logs:{html:'./logs'}
  },
  sql: {
    host: '113.204.227.43',
    port:3306,
    user:'root',
    password: 'sdfgsdf876!',
    database: 'ayyo1'
  },
  redis:{
    password:'hw123adsf!',
    host:'113.204.227.43',
    port:6739,
    dbs:{
      session:3,
      work:4
    }
  },
  disDefaultModels:{},
  authRouter:'/v1',
  unitId:'xx'
}