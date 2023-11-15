(function (G) {
    window["components_Input_WMap_Point_Point"]({
    "component": true,
    "usingComponents": {}
},{
template:'#TEMPLATE_components_Input_WMap_Point_Point',

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
                markers: [],
                longitude:106.51107,
                latitude:29.50197,
                scale:11
            }
        },
        mounted: function () {
            let attr = this.getData('attr') || {};
            attr.max = attr.max || 1
            this.map = G.createMapContext(this.getData('name'))
            let center = attr.center || [106.51107, 29.50197],scale = attr.zoom || 11
            this.setData({
                longitude:center[0],
                latitude:center[1],
                scale
            })
            if(this.data.value){
                this.fliter(this.data.value)
            }else if(attr.max == 1){
                let point = center
                let value1 = JSON.stringify([point])
                this.fliter(value1)
                this.triggerEvent('change', {
                    value: value1,
                    detail: {
                        type: 'markerMove',
                        longitude: point[0],
                        latitude: point[1]
                    },
                    id: this.getData('name'),
                    index: this.getData('index')
                })
            }
            
        },
        methods: {
            markerClick(event){
                let id = event.detail.markerId
                if (!this.getData('disabled')) {
                    G.confirm('删除位置点?').then(() => {
                        let value1 = [],markers = [],_marker
                        for (let i = 0; i < this.data.markers.length; i++) {
                            let marker = this.data.markers[i]
                            if (marker.id != id) {
                                value1.push([marker.longitude, marker.latitude])
                                markers.push(marker)
                            }else{
                                _marker = marker
                            }
                        }
                        this.setData({
                            markers,
                            value1
                        })
                        this.triggerEvent('change', {
                            value: value1.length ? JSON.stringify(value1) : '',
                            detail: {
                                type: 'markerDelete',
                                longitude: _marker.longitude,
                                latitude: _marker.latitude
                            },
                            id: this.getData('name'),
                            index: this.getData('index')
                        })
                    })
                } else {
                    this.triggerEvent('click', {
                        event,
                        type:'marker',
                        id: this.getData('name'),
                        index: this.getData('index')
                    })
                }
            },
            mapClick(event){
                let attr = this.getData('attr') || {}
                if (!this.getData('disabled')) {
                    if(attr.max == 1 || attr.max === undefined){
                        if(this.data.markers.length == 1){
                            let point = [event.detail.longitude,event.detail.latitude]
                            let value1 = JSON.stringify([point])
                            this.fliter(value1)
                            this.triggerEvent('change', {
                                value: value1,
                                detail: {
                                    type: 'markerMove',
                                    longitude: point[0],
                                    latitude: point[1]
                                },
                                id: this.getData('name'),
                                index: this.getData('index')
                            })
                            return false
                        }
                    }else if(this.data.markers.length < attr.max){
                        this.addPonit(event.detail.longitude, event.detail.latitude)
                    }
                } else {
                    this.triggerEvent('click', {
                        event,
                        type:'map',
                        id: this.getData('name'),
                        index: this.getData('index')
                    })
                }
            },
            fliter(value) {
                if (value == JSON.stringify(this.data.value1)) return
                this.setData({
                    value1:G.string(value).parse([])
                })
                if (this.map) {
                    this.data.markers = []
                    let promises = []
                    for (let i = 0; i < this.data.value1.length; i++) promises.push(this.addMarker(this.data.value1[i]))
                    Promise.all(promises).then(() => {
                        this.setData({
                            markers:this.data.markers
                        })
                    })
                }
            },
            addMarker(point) {
                return new Promise(next => {
                    let attr = this.getData('attr') || {}
                    let markerConfig = attr.marker || {}
                    if (typeof markerConfig == 'function') {
                        markerConfig(point, this.getData('name')).then(_markerConfig => {
                            next(_markerConfig)
                        })
                    } else {
                        next(markerConfig)
                    }
                }).then(markerConfig => {
                    return new Promise(next => {
                        this.data.value1.push(point)
                        this.data.markers.push({
                            longitude:point[0],
                            latitude:point[1],
                            id:G.zIndex(),
                            ...markerConfig
                        })
                        next()
                    })
                })
            },
            addPonit(lon, lat) {
                G.confirm('标记位置点?').then(() => {
                    this.addMarker([lon, lat]).then(() => {
                        this.setData({
                            markers:this.data.markers
                        })
                        this.triggerEvent('change', {
                            value: this.data.value1.length ? JSON.stringify(this.data.value1) : '',
                            detail: {
                                type: 'markerAdd',
                                longitude: lon,
                                latitude: lat
                            },
                            id: this.getData('name'),
                            index: this.getData('index')
                        })
                    })
                })
            }
        }
    })
})(Y)