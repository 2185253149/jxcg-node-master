!function(t){window.components_Input_Editor_Editor({component:!0,usingComponents:{mixinput:"/components/Input/Mixinput/Mixinput"}},{template:"#TEMPLATE_components_Input_Editor_Editor",props:{name:{type:String,default:t.guid()},index:{type:Number},disabled:{type:Boolean,default:!1},value:{type:String,default:"",observer:function(t,e){this.fliter(t)}},placeholder:{type:String,default:""},file:{type:Boolean,default:!1},attr:{type:Object,default:{}}},data:function(){return{platform:t.platform,value1:"",heightStyle:"100%"}},methods:{change:function(t){var e=t.detail;this.fliter(e.html),this.triggerEvent("change",{value:e.html,detail:e,id:this.getData("name"),index:this.getData("index")})},fliter:function(t){this.setData({value1:t}),this.editor&&this.editor.setContents({html:t})}},mounted:function(){let e=this.getData("name"),i=this.getData("attr")||{};"Web"==this.getData("platform")?this.editor=new t.RichEditor(this.$refs[e],{...i,name:e,placeholder:this.getData("placeholder"),value:this.getData("value"),bindinput:this.change}):(this.setData({heightStyle:i.height?i.height+"rpx":"100%;"}),this.createSelectorQuery().select("#"+e).context(t=>{this.editor=t.context,this.fliter(this.getData("value"))}).exec())}})}(Y);