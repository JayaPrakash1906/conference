const {CreateRoomModel, FetchRoomModel, UpdateRoomModel, DeleteRoomModel}  = require('../model/admin_roomModel');


const CreateRoom = async(req, res) => {
    let {name, location, capacity, floor, image, description, equipment} = req.body;
    
    // If a new image file is uploaded
    if (req.file) {
        image = `/uploads/${req.file.filename}`;
    }
    
    if (!name || !location || !capacity || !floor || !image || !description || !equipment ) {
        return res.status(400).json({status: 'Check all fields'});
    }
    
    else {
        try {
            const result = await CreateRoomModel(name, location, capacity, floor, image, description, equipment);
            return res.status(201).json(result);
        } catch (err) {
            return res.status(500).json({status: 'Internal Server Error'});
            //console.log(err);
        }
    }
};

const FetchRoom = async(req, res) => {
    try {
        const result = await FetchRoomModel();  
        return res.status(200).json(result);
    } catch(err) {
        console.error(err);
        return res.status(500).json({status: 'Internal Server Error'});
    }
};

const UpdateRoom = async (req, res) => {  
    const id = req.params.id;
    
    if (!id) {
        return res.status(400).json({ error: "Params missing" });
    }
    
    try {
        const { name, location, capacity, floor, description, equipment } = req.body;
        let image = req.body.image;

        // If a new image file is uploaded
        if (req.file) {
            image = `/uploads/${req.file.filename}`;
        }
    
        if (!name || !location || !capacity || !floor || !description || !equipment ) {
            return res.status(400).json({ error: "All fields are required" });
        }
    
        const result = await UpdateRoomModel(name, location, capacity, floor, image, description, equipment, id);
        
        if (result.rowCount === 0) { 
            return res.status(404).json({ error: "Room not found" });
        }
    
        return res.status(200).json({ message: "Room updated successfully", data: result.rows[0] });
    } catch (err) {
        console.error("Error updating room:", err);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

const DeleteRoom = async (req, res) => {
    const id = req.params.id;  

    if (!id) {
        return res.status(400).json({ error: "Params missing" });  
    }

    try {
        const result = await DeleteRoomModel(id);  
        return res.status(200).json(result);
    } catch (err) {
        return res.status(500).json({ error: err.message }); 
    }
};

module.exports = { CreateRoom, FetchRoom, UpdateRoom, DeleteRoom };




























































// const {CreateEventModel, FetchEventsModel, UpdateEventsModel, DeleteEventModel}  = require('../model/eventModel');
// const EmailValid = require('../Validation/EmailValid');
// const PhoneNumberValid = require('../Validation/PhoneNumberValid');

// const CreateEvents = async(req, res) =>{
//     const {name, meeting_name,  start_time, end_time, purpose, contact_number, email, team_category, team_sub_category, other_option} = req.body;
//     if(!name || !meeting_name || !start_time || !end_time || !purpose || !contact_number || !email || !team_category, !team_sub_category ) 
//     {
//         res.status(400).json({status: 'Check all fields'})
//     }
//     else if(!EmailValid(email))
//         {
//             res.status(422).json({Request: "Not a valid email"})
//         }
//         else if(!PhoneNumberValid(contact_number))
//             {
//                 res.status(403).json({Request: "Not a valid Phone number"})
//             }
//     else 
//     {
//         try
//         {
//             const result = await CreateEventModel(name, meeting_name, start_time, end_time, purpose, contact_number, email, team_category, team_sub_category, other_option);
//             res.status(201).json(result);
//         }
//         catch(err) 
//         {
//             res.status(500).json({status: 'Internal Server Error'});
//             //console.log(err);
//         }
//     }
// }

// const FetchEvents = async(req, res) => {
//   try 
//   {
//       const result = await FetchEventsModel();  
//       res.status(200).json(result);
//   }
//   catch(err)
//   {
//       console.log(err);
//   }
// }

// const UpdateEvents = async (req, res) => {  
//     const  email  = req.params.id;
//     if (!email) {
//       return res.status(400).json({ error: "Params missing" });
        
//     }
//     else{
//         try {
//             const { name, meeting_name, start_time, end_time, purpose, contact_number, team_category, team_sub_category } = req.body;
        
//           if (!name || !meeting_name || !start_time || !end_time || !purpose || !contact_number || !team_category || !team_sub_category ) {
//             return res.status(400).json({ error: "All fields are required" });
//             //console.log(err);
//           }
      
//           const result = await UpdateEventsModel(name, meeting_name, start_time, end_time, purpose, contact_number, team_category, team_sub_category,  email);
      
//           return res.status(200).json({ message: "Event updated successfully", data: result });
//         } catch (err) {
//           console.error("Error updating event:", err);
//           return res.status(500).json({ error: "Internal Server Error" });
//         }
//     }
//     // try {
//     //     const { name, meeting_name, start_time, end_time, purpose, contact_number, team_category, team_sub_category, other_option,  } = req.body;
    
//     //   if (!name || !meeting_name || !start_time || !end_time || !purpose || !contact_number || !team_category || !team_sub_category || !other_option ||) {
//     //     return res.status(400).json({ error: "All fields are required" });
//     //   }
  
//     //   const result = await UpdateEventsModel(name, meeting_name, start_time, end_time, purpose, contact_number, team_category, team_sub_category, other_option, email);
  
//     //   return res.status(200).json({ message: "Event updated successfully", data: result });
//     // } catch (err) {
//     //   console.error("Error updating event:", err);
//     //   return res.status(500).json({ error: "Internal Server Error" });
//     // }
//   };

//   const DeleteEvents = async (req, res) => {
//     const email = req.params.id;  

//     if (!email) {
//         return res.status(400).json({ error: "Params missing" });  
//     }

//     try {
//         const result = await DeleteEventModel(email);  
//         return res.status(200).json(result);
//     } catch (err) {
//         return res.status(500).json({ error: err.message }); 
//     }
// };
  

// module.exports = {CreateEvents, FetchEvents, UpdateEvents, DeleteEvents};
