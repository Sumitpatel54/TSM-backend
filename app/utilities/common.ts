/* eslint-disable no-trailing-spaces */
/* eslint-disable semi */
import AWS from "aws-sdk"
import URL from "url"
import { v4 as uuidv4 } from 'uuid'

const stringIsAValidUrl = (s: any) => {
  try {
    new URL.URL(s)
    return true
  } catch (err) {
    return false
  }
}

// get file upload path
const geFileURL = (req: any) => {
  return req.protocol + "://" + req.headers.host + req.file.destination.replace(/public/g, '') + '/' + req.file.filename
}
const isFloat = (x: any) => { return !!(x % 1) }
const isNumber = (str: any) => {
  return !isNaN(str) && !isNaN(parseFloat(str))
}

const getTotalPages = (totalData: number, perPage: number) => {
  let totalPage = totalData / perPage
  let totalPages: any = 1

  if (totalPage > 1) {
    totalPages = totalPage
  }

  if (isFloat(totalPages)) {
    totalPages = parseInt(totalPages) + 1
  }
  return totalPages
}

/**
 * Used to generate time stamp from date and time
 * @param dateToUse
 * @param timeString
 *
 * @returns timeStamp
 */
const getTimestampFromDate = (dateToUse: string, timeString: string) => {
  try {
    if (timeString.includes(":")) {
      const timeArray = timeString.split(":")
      const hourToSet = Number(timeArray[0])
      const minToSet = Number(timeArray[1])

      let timeStamp: number = Number(((new Date(dateToUse).setHours(hourToSet, minToSet, 0)) / 1000).toFixed(0))
      return timeStamp
    }
    throw new Error('Time is not in the proper format')
  } catch (error: any) {
    throw new Error(error)
  }
}

/**
* @summary - Get s3 signed url
*/

const validateAWSCredentials = () => {
  const required = ['BUCKET', 'ACCESS_KEY_ID', 'SECRET_ACCESS_KEY'];
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required AWS credentials: ${missing.join(', ')}`);
  }
  
  // Validate credential format
  if (process.env.ACCESS_KEY_ID?.length !== 20) {
    throw new Error('Invalid ACCESS_KEY_ID format');
  }
  
  if (process.env.SECRET_ACCESS_KEY?.length !== 40) {
    throw new Error('Invalid SECRET_ACCESS_KEY format');
  }
};

const getUploadURLWithDir = async (files: any | any[], dirName: string) => {
  try {
    // Validate AWS credentials first
    validateAWSCredentials();
    
    const filesArray = Array.isArray(files) ? files : [files];
    
    // Configure AWS SDK
    AWS.config.update({
      accessKeyId: process.env.ACCESS_KEY_ID,
      secretAccessKey: process.env.SECRET_ACCESS_KEY,
      region: 'us-east-1',
      httpOptions: {
        timeout: parseInt(process.env.AWS_UPLOAD_TIMEOUT || '300000'),
        connectTimeout: parseInt(process.env.AWS_CONNECT_TIMEOUT || '5000')
      }
    });

    // Initialize S3 after configuring AWS
    const s3 = new AWS.S3();

    const uploadPromises = filesArray.map(async (file: any) => {
      const fileMime: any = file.name || file.originalname;
      const arr = fileMime.split(".");
      const fileExt = arr[arr.length - 1];
      const now = Math.round(+new Date() / 1000);
      const filePath = dirName ? `${dirName}/` : '';
      const fileName = `${now}.${fileExt}`;
      const fileFullName = `${filePath}${fileName}`;

      // Use managed upload for better performance
      const upload = new AWS.S3.ManagedUpload({
        partSize: 10 * 1024 * 1024, // 10 MB chunks
        queueSize: 4, // Process 4 parts simultaneously
        params: {
          Bucket: process.env.BUCKET as string,
          Key: fileFullName,
          Body: file.tempFilePath ? 
            require('fs').createReadStream(file.tempFilePath) : 
            file.data,
        }
      });

      // Add upload progress logging
      upload.on('httpUploadProgress', (progress) => {
        console.log(`Upload progress for ${fileName}: ${Math.round((progress.loaded * 100) / progress.total)}%`);
      });

      const result = await upload.promise();
      console.log(`Upload completed for ${fileName}`);
      
      return result.Location; // Return the public URL of the uploaded file
    });

    const urls = await Promise.all(uploadPromises);
    return urls;
  } catch (error) {
    console.error("Error in getUploadURL:", error);
    // Add more detailed error logging
    if (error instanceof Error) {
      console.error("Error details:", {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
    }
    throw error;
  }
};



const getUploadURL = async (files: any | any[] ) => {
  try {
    const filesArray = Array.isArray(files) ? files : [files];
    
    const s3 = new AWS.S3({
          accessKeyId: process.env.ACCESS_KEY_ID,
          secretAccessKey: process.env.SECRET_ACCESS_KEY
    })

    AWS.config.update({ region: 'us-east-1' });

    const uploadPromises = filesArray.map(async file => {
      const buffer: any = file.data;
      const fileMime: any = file.name;
      const arr = fileMime.split(".");
      const fileExt = arr[arr.length - 1];
      const hash = uuidv4();
      const now = Math.round(+new Date() / 1000);
      const filePath = `${hash}/`;
      const fileName = `${now}.${fileExt}`;
      const fileFullName = `${filePath}${fileName}`;

      const s3Params: AWS.S3.PutObjectRequest = {
        Bucket: process.env.BUCKET as string,
        Key: fileFullName,
        Body: buffer,
      };

      await s3.upload(s3Params).promise();
      return `https://${process.env.BUCKET}.s3.amazonaws.com/${fileFullName}`;
    });

    const urls:any = await Promise.all(uploadPromises);
    return urls;
  } catch (error) {
    console.error("Error in getUploadURL:", error);
    throw error;
  }
};



// const getUploadURL = async (file: any) => {
//   const s3 = new AWS.S3({
//     accessKeyId: process.env.ACCESS_KEY_ID,
//     secretAccessKey: process.env.SECRET_ACCESS_KEY
//   })

//   AWS.config.update({ region: 'us-east-1' })

//   // create a buffer from base64 string
//   const buffer: any = file.data

//   // get the file extension
//   const fileMime: any = file.name
//   const arr = fileMime.split(".")

//   // if (fileMime === null) throw new Error("Uploaded file is not supported")

//   let fileExt = fileMime.split(".")[arr.length - 1]
//   let hash = v4()
//   let now = Math.round(+new Date() / 1000)

//   let filePath = hash + "/"
//   let fileName = now + '.' + fileExt
//   let fileFullName = filePath + fileName
//   // let fileFullPath = process.env.BUCKET + fileFullName


//   const s3Params = {
//     Bucket: process.env.BUCKET,
//     Key: fileFullName,
//     Body: buffer,
//   }

//   // @ts-ignore
//   await s3.putObject(s3Params).promise()

//   return "https://" + process.env.BUCKET + ".s3.amazonaws.com/" + fileFullName
// }

/**
* @summary - Checks for null or undefined values
* @param {Object} inObj Requests passed to the express endpoint
* @returns Boolean
**/
const validateRequestForEmptyValues = (inObj: any) => {
  if (typeof inObj !== 'object' && inObj === null) {
    throw new Error("inObj must be an Object")
  }

  // cache object properties
  let inObjKeys = Object.keys(inObj)

  // loop through and check for null/falsy values
  // if found send back the offending property
  for (let i = 0; i < inObjKeys.length; i++) {
    if (inObj[inObjKeys[i]] === null || inObj[inObjKeys[i]] === undefined) {
      throw new Error(`${inObjKeys[i]} is required`)
    }

    // validate array if it is empty
    if (inObj[inObjKeys[i]] && Array.isArray(inObj[inObjKeys[i]]) && (inObj[inObjKeys[i]].length === 0)) {
      throw new Error(`${inObjKeys[i]} cannot be empty`)
    }
  }

  return true
}

const generatePresignedUrl = async (fileName: string, fileType: string, dirName: string) => {
  try {
    validateAWSCredentials();
    
    AWS.config.update({
      accessKeyId: process.env.ACCESS_KEY_ID,
      secretAccessKey: process.env.SECRET_ACCESS_KEY,
      region: 'us-east-1'
    });

    const s3 = new AWS.S3();
    const now = Math.round(+new Date() / 1000);
    const filePath = dirName ? `${dirName}/` : '';
    const fileKey = `${filePath}${now}-${fileName}`;

    const params = {
      Bucket: process.env.BUCKET as string,
      Key: fileKey,
      ContentType: fileType,
      Expires: 3600, // URL expires in 1 hour
    };

    const uploadUrl = await s3.getSignedUrlPromise('putObject', params);
    
    return {
      uploadUrl,
      fileKey,
      fileUrl: `https://${process.env.BUCKET}.s3.amazonaws.com/${fileKey}`
    };
  } catch (error) {
    console.error("Error generating presigned URL:", error);
    throw error;
  }
};

export default { geFileURL, getTotalPages, stringIsAValidUrl, getTimestampFromDate, getUploadURL, isNumber, validateRequestForEmptyValues, getUploadURLWithDir,validateAWSCredentials, generatePresignedUrl }
