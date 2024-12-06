const db = require("../firebaseClient");

const getAllModules = async (req, res) => {

    try {
        const modulesRef = db.collection("educationModules");
        const modulesSnapshot = await modulesRef.get();

        const modules = modulesSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));

        res.status(200).json(modules);

        
    } catch (error) {
        console.error("Error fetching modules:", error);
        res.status(500).json({ error: "Failed to fetch modules" });
        
    }


}

const addModules = async (req, res) => {
    const { title, content, category, imageUrl,  } = req.body;
     try {
        const modulesRef = db.collection("educationModules");
        const newModuleRef = modulesRef.doc();

        await newModuleRef.set({
            title,
            content,
            category,
            imageUrl,
            createdAt: new Date(),
        });
        const modulesSnapshot = await newModuleRef.get();

        res.status(200).json({
            status: "success",
             message: "Module added successfully",
             data: {
                 id: modulesSnapshot.id,
                 ...modulesSnapshot.data(),
             },
             });
        
     } catch (error) {
        console.error("Error adding module:", error);
        res.status(500).json({ error: "Failed to add module" });
        
     }

}



const editModules = async (req, res) => {
    
}
module.exports = {
    getAllModules,
    addModules

}