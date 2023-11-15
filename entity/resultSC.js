module.exports = {
    TABLE_NICK_NAME:'教学成果',
    TABLE_DESC:'教学成果数据',
    pro_name:{
        label:'项目名称',
        type:'input',
        rule: {
            NotNull: true
        },
    },
    type: {
        label: '业绩类别',
        attr: {
            actions: [
                { name: '本科教学质量工程', value: '1' },
                { name: '教育教学研究项目', value: '2' },
                { name: '教学技能比赛', value: '3' },
                { name: '教育教学成果获奖', value: '4' },
                { name: '育人成效', value: '5' },
                { name: '教材', value: '6' },
                { name: '教育教学研究论文', value: '7' },
                { name: '学校专项教育教学项目', value: '8' }
            ]
        },
        defaultValue: '1',
        type: 'select',
        desc: '1 本科教学质量工程，2 教育教学研究项目，3 教学技能比赛，4 教育教学成果获奖，5 育人成效，6 教材，7 教育教学研究论文，8 学校专项教育教学项目',
    },
    abc: {
        label: '项目级别',
        attr: {
            actions: [
                { name: 'A', value: '1' },
                { name: 'B', value: '2' },
                { name: 'C', value: '3' },
                { name: 'D', value: '4' },
                { name: '专业建设', value: '5' },
                { name: '其他临时性项目', value: '6' },
            ]
        },
        type: 'select',
        defaultValue: '1',
    },
    grade: {
        label: '教学业绩等级',
        attr: {
            actions: [
                { name: 'A1', value: '1' },
                { name: 'A2', value: '2' },
                { name: 'B1', value: '3' },
                { name: 'B2', value: '4' },
                { name: 'C1', value: '5' },
                { name: 'C2', value: '6' },
                { name: 'D', value: '7' },
                { name: '重大', value: '8' },
                { name: '重点', value: '9' },
                { name: '一般', value: '10' },
                { name: '国家级', value: '11' },
                { name: '省部级', value: '12' },
                { name: '校级', value: '13' },
                { name: '新专业申报', value: '14' },
            ]
        },
        type: 'select',
        defaultValue: '1',
    },
    sub_grade: {
        label: '子等级',
        attr: {
            actions: [
                { name: '一等', value: '1' },
                { name: '二等', value: '2' },
                { name: '三等', value: '3' },
                { name: '无', value: '4' },
            ]
        },
        type: 'select',
        defaultValue: '4',
    },
    userId: {
        label: '申请人',
        type:'onlyselect',
        attr: {
            url: '/api/model/user'
        },
        rule: {
            NotNull: true
        },
    },
    score: {
        label: '教学业绩分',
        type:'input',
        rule: {
            NotNull: true
        },
    },
    total_score: {
        label: '总分',
        type:'input',
    },
    num: {
        label: '申请序列',
        attr: {
            actions: [
                { name: '1', value: '1' },
                { name: '2', value: '2' },
                { name: '3', value: '3' },
                { name: '4', value: '4' },
                { name: '5', value: '5' },
                { name: '6', value: '6' },
                { name: '7', value: '7' },
                { name: '8', value: '8' },
                { name: '9', value: '9' },
            ]
        },
    },
    file: {
        label: '文件上传',
        type:'file',
    },
    status: {
        label: '成果状态',
        attr: {
            actions: [
                { name: '二级学院审核', value: '1' },
                { name: '教务处审核', value: '2' },
                { name: '审核通过', value: '3' },
                { name: '审核失败', value: '4' },
            ]
        },
    },
    reason: {
        label: '审核结果',
    },
}
