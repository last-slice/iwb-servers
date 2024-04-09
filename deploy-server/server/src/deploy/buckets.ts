export let iwbBuckets:Map<string,any> = new Map()
export let deployBuckets:Map<string,any> = new Map()

iwbBuckets.set("bucket1", {
    enabled: true,
    available:true,
    status: "",
    owner:"",
    id:"bucket1",
    address:""
})
iwbBuckets.set("bucket2", {
    enabled: false,
    available:true,
    status: "",
    owner:"",
    id:"bucket2",
    address:""
})
iwbBuckets.set("bucket3", {
    enabled: false,
    available:true,
    status: "",
    owner:"",
    id:"bucket3",
    address:""
})


deployBuckets.set("bucket1", {
    enabled: true,
    available:true,
    status: "",
    owner:"",
    id:"bucket1",
    address:""
})
deployBuckets.set("bucket2", {
    enabled: false,
    available:false,
    status: "",
    owner:"",
    id:"bucket2",
    address:""
})
deployBuckets.set("bucket3", {
    enabled: false,
    available:false,
    status: "",
    owner:"",
    id:"bucket3",
    address:""
})