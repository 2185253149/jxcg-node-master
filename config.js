module.exports = {
  port: 80,
  router: {
    default: './admin/H5',
    //www:{html:'./www'},
    logs:{html:'./logs'}
  },
  sql: {
    host: '192.168.1.101',
    port:3306,
    user:'root',
    password: 'sdfgsdf876!',
    database: 'xxx'
  },
  // redis:{
  //   password:'xxx',
  //   host:'192.168.1.100',
  //   port:6739,
  //   dbs:{
  //     session:1,
  //     work:2
  //   }
  // },
  disDefaultModels:{},
  authRouter:'/v1',
  unitId:'xx'
}