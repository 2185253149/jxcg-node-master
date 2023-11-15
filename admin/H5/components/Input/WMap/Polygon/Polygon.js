(function (G) {
    window["components_Input_WMap_Polygon_Polygon"]({
    "component": true,
    "usingComponents": {}
},{
template:'#TEMPLATE_components_Input_WMap_Polygon_Polygon',

        props: {
            name: {
                type: String,
                default: G.guid()
            },
            index: {
                type: Number
            },
            disabled: {
                type: Boolean,
                default: true
            },
            value: {
                type: String,
                default: '',
                observer: function (newValue, oldValue) {
                    this.fliter(newValue);
                }
            },
            attr: {
                type: Object,
                default: {}
            }
        },
        data: function () {
            return {
                value1: [],
                map: '',
                polygons: [],
                longitude:106.51107,
                latitude:29.50197,
                scale:11
            }
        },
        mounted: function () {
            let attr = this.getData('attr') || {};
            this.map = G.createMapContext(this.getData('name'))
            let center = attr.center || [106.51107, 29.50197],scale = attr.zoom || 11
            this.setData({
                longitude:center[0],
                latitude:center[1],
                points:JSON.parse(this.data.value)[0],
                scale
            })
        },
        methods: {
            polygonClick(event){
                this.triggerEvent('click', {
                    event,
                    type:'polygon',
                    id: this.getData('name'),
                    index: this.getData('index')
                })
            }
        }
    })
})(Y)