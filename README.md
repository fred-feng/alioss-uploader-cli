aliyun oss upload cli

```
npm i -g alioss-uploader-cli
```

make file '.aliossrc'
```
{
    "accessKeyId": "***",
	"accessKeySecret": "***",
	"region": "oss-cn-hangzhou", // eg: oss-cn-hangzhou
	"bucket": "stgame",
	"prefix": "test", // oss directory prefix; eg: auto_upload_ci/test
    "srcPath":"dist", // upload directory
    "exclude": ".*$" // Optional, default: .*$
}
```

edit 'package.json'
```
{
    ...
    "scripts": :{
        "upload": "aliossUploader"
        ...
    }
    ...
}
```

upload

```
npm run upload
```