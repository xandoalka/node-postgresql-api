const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bucket = require('../firebaseConfig.js'); // Path ke konfigurasi Firebase

const uploadImageToFirebase = (file) => {
  return new Promise((resolve, reject) => {
    const blob = bucket.file(Date.now() + '-' + file.originalname);
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
    const file = bucket.file(fileName);

    file.delete((err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
};

// Get all items
exports.getAllItems = async (req, res) => {
  try {
    const items = await prisma.item.findMany();
    res.status(200).json(items);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Get a single item by ID
exports.getItemById = async (req, res) => {
  const { id } = req.params;
  try {
    const item = await prisma.item.findUnique({
      where: { id: parseInt(id) }
    });
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }
    res.status(200).json(item);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Create a new item
exports.createItem = async (req, res) => {
  const { title, description, developer } = req.body;
  try {
    const logoUrl = req.files.logo ? await uploadImageToFirebase(req.files.logo[0]) : null;
    const imageUrl = req.files.image ? await uploadImageToFirebase(req.files.image[0]) : null;

    const newItem = await prisma.item.create({
      data: { title, description, developer, logo: logoUrl, image: imageUrl }
    });
    res.status(201).json(newItem);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Patch an existing item (partial update)
exports.patchItem = async (req, res) => {
  const { id } = req.params;
  try {
    const item = await prisma.item.findUnique({
      where: { id: parseInt(id) }
    });

    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    const logoUrl = req.files.logo ? await uploadImageToFirebase(req.files.logo[0]) : null;
    const imageUrl = req.files.image ? await uploadImageToFirebase(req.files.image[0]) : null;

    // Hapus foto lama jika ada foto baru yang di-upload
    if (logoUrl && item.logo) {
      await deleteImageFromFirebase(item.logo);
    }
    if (imageUrl && item.image) {
      await deleteImageFromFirebase(item.image);
    }

    const data = { ...req.body };
    if (logoUrl) data.logo = logoUrl;
    if (imageUrl) data.image = imageUrl;

    const updatedItem = await prisma.item.update({
      where: { id: parseInt(id) },
      data: data
    });
    res.status(200).json(updatedItem);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Delete an item
exports.deleteItem = async (req, res) => {
  const { id } = req.params;
  try {
    const item = await prisma.item.findUnique({
      where: { id: parseInt(id) }
    });

    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    // Hapus foto dari Firebase Storage
    if (item.logo) {
      await deleteImageFromFirebase(item.logo);
    }
    if (item.image) {
      await deleteImageFromFirebase(item.image);
    }

    await prisma.item.delete({
      where: { id: parseInt(id) }
    });
    res.status(200).json({ message: 'Item deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
