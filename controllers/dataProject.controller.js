const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bucket = require('../firebaseConfig.js');
const uniqid = require('uniqid');

const uploadImageToFirebase = (file) => {
   return new Promise((resolve, reject) => {
      const uniqueName = `dataImage/${uniqid()}${file.mimetype === 'image/jpeg' ? '.jpg' : '.png'}`;
      const blob = bucket.file(uniqueName);
      const blobStream = blob.createWriteStream({
         metadata: {
            contentType: file.mimetype
         }
      });

      blobStream.on('error', (err) => reject(err));

      blobStream.on('finish', async () => {
         const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
         resolve(publicUrl);
      });

      blobStream.end(file.buffer);
   });
};

const deleteImageFromFirebase = (fileUrl) => {
   return new Promise((resolve, reject) => {
      const fileName = fileUrl.split('/').pop();
      const file = bucket.file(`dataImage/${fileName}`);

      file.delete((err) => {
         if (err) {
            reject(err);
         } else {
            resolve();
         }
      });
   });
};

// Get all dataProjects
exports.getAllData = async (req, res) => {
   try {
      const dataProjects = await prisma.dataProject.findMany({
         orderBy: {
            id: 'asc'
         }
      });
      res.status(200).json(dataProjects);
   } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal Server Error' });
   }
};

// Get a single dataProject by ID
exports.getDataById = async (req, res) => {
   const { id } = req.params;
   try {
      const dataProject = await prisma.dataProject.findUnique({
         where: { id: parseInt(id) }
      });
      if (!dataProject) {
         return res.status(404).json({ error: 'DataProject not found' });
      }
      res.status(200).json(dataProject);
   } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal Server Error' });
   }
};

// Create a new dataProject
exports.createData = async (req, res) => {
   const { type, title, description, url, target } = req.body;
   try {
      const imageUrl = req.files.image ? await uploadImageToFirebase(req.files.image[0]) : null;

      const newDataProject = await prisma.dataProject.create({
         data: { type, title, description, url, target, image: imageUrl }
      });
      res.status(201).json(newDataProject);
   } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal Server Error' });
   }
};

// Patch an existing dataProject (partial update)
exports.patchData = async (req, res) => {
   const { id } = req.params;
   try {
      const dataProject = await prisma.dataProject.findUnique({
         where: { id: parseInt(id) }
      });

      if (!dataProject) {
         return res.status(404).json({ error: 'DataProject not found' });
      }

      const imageUrl = req.files.image ? await uploadImageToFirebase(req.files.image[0]) : null;

      if (imageUrl && dataProject.image) {
         await deleteImageFromFirebase(dataProject.image);
      }

      const data = { ...req.body };
      if (imageUrl) data.image = imageUrl;

      const updatedDataProject = await prisma.dataProject.update({
         where: { id: parseInt(id) },
         data: data
      });
      res.status(200).json(updatedDataProject);
   } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal Server Error' });
   }
};

// Delete a dataProject
exports.deleteData = async (req, res) => {
   const { id } = req.params;
   try {
      const dataProject = await prisma.dataProject.findUnique({
         where: { id: parseInt(id) }
      });

      if (!dataProject) {
         return res.status(404).json({ error: 'DataProject not found' });
      }

      if (dataProject.image) {
         await deleteImageFromFirebase(dataProject.image);
      }

      await prisma.dataProject.delete({
         where: { id: parseInt(id) }
      });
      res.status(200).json({ message: 'DataProject deleted successfully' });
   } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal Server Error' });
   }
};
