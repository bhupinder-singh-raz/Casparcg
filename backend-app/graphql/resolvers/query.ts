import ConstantsService from "../../services/constants.service";
import DBService from "../../services/db.service";

export default {
    captions: async () => {
        const db = DBService.getDb();
        return db.collection("captions").find().toArray();
    },
};
