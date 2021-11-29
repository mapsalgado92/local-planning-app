import { ObjectID } from "mongodb";
import { updateInDatabase, connectToDatabase, getFromDatabase } from "../../lib/mongodb";

export default async function handler(req, res) {

  const { db } = await connectToDatabase()

  const { collection } = req.query

  if (req.method === 'POST') {
    let newData = req.body.item
    console.log("NEW DATA", newData)
    //handle ID
    let id = newData._id
    delete newData._id
    await updateInDatabase(db, collection, { _id: ObjectID(id) }, newData)
    res.status(200).json(newData)
    console.log(`Item Updated in ${collection}`)
  } else if (req.method === 'GET') {
    let output = await getFromDatabase(db, collection, {})
    console.log(`Item Fetched from ${collection}`)
    res.status(200).json(output)
  }
}