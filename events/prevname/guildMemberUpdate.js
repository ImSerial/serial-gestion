const db = require('quick.db');

module.exports = async (client, oldMember, newMember) => {
    if (oldMember.displayName !== newMember.displayName) {
        const prevNames = db.get(`prevnick_${newMember.guild.id}_${newMember.id}`) || [];
        
        prevNames.push({
            nickname: oldMember.displayName,
            date: Date.now()
        });

        db.set(`prevnick_${newMember.guild.id}_${newMember.id}`, prevNames);
    }
};
