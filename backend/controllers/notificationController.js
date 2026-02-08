const Notification = require("../models/Notification");


// GET ALL
exports.getNotifications = async (req,res)=>{
    try{

        const userId = req.user.id;

        const notifications = await Notification.find({
            userId
        }).sort({createdAt:-1});

        res.json(notifications);

    }catch(err){
        res.status(500).json({error:err.message});
    }
};



// MARK READ
exports.markAsRead = async (req, res) => {
    try {
        const notificationId = req.params.id;
        const userId = req.user.id;

        const notification = await Notification.findOneAndUpdate(
            { _id: notificationId, userId },
            { read: true },
            { new: true }
        );

        if (!notification) {
            return res.status(404).json({
                message: "Notification not found"
            });
        }

        res.json({
            message: "Notification marked as read ✅"
        });

    } catch (err) {
        res.status(500).json({
            error: err.message
        });
    }
};
