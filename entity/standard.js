module.exports = {
    TABLE_NICK_NAME:'记分标准',
    TABLE_DESC:'记分标准',
    type: {
        label: '记分类别',
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
        label: '分级',
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
        label: '等级',
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
                { name: '无', value: '0' },
                { name: '一等', value: '1' },
                { name: '二等', value: '2' },
                { name: '三等', value: '3' },
            ]
        },
        type: 'select',
        defaultValue: '0',
    },
    scroe: {
        label: '计分标准',
        type: 'input'
    },
}
