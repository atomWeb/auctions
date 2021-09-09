import { v4 as uuid } from "uuid";
import AWS from "aws-sdk";
import commonMiddleware from "../lib/commonMiddleware";
import createError from "http-errors";

const dynamodb = new AWS.DynamoDB.DocumentClient();
const auctionsTable = process.env.AUCTIONS_TABLE;

async function createAuction(event, context) {
  // const { title } = JSON.parse(event.body);
  const { title } = event.body;
  let now = new Date();
  // now.toLocaleString(process.env.TLOCALE) // Buscar forma de hacerlo

  const auction = {
    id: uuid(),
    title,
    status: "OPEN",
    createdAt: now.toISOString(),
    highestBid: { 
      amount: 0,
    },
  };

  try {
    await dynamodb
      .put({
        TableName: auctionsTable,
        Item: auction,
      })
      .promise();
  } catch (error) {
    console.error(error);
    throw new createError.InternalServerError(error);
  }

  return {
    statusCode: 201,
    body: JSON.stringify(auction),
  };
}

export const handler = commonMiddleware(createAuction);
