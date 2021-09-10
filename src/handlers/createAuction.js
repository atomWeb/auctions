import { v4 as uuid } from "uuid";
import AWS from "aws-sdk";
import validator from "@middy/validator";
import commonMiddleware from "../lib/commonMiddleware";
import createAuctionSchema from "../lib/schemas/createAuctionSchema";
import createError from "http-errors";

const dynamodb = new AWS.DynamoDB.DocumentClient();
const auctionsTable = process.env.AUCTIONS_TABLE;

async function createAuction(event, context) {
  // const { title } = JSON.parse(event.body); // Lo hace el middleware
  const { title } = event.body;
  const { email } = event.requestContext.authorizer;
  const now = new Date();
  // now.toLocaleString(process.env.TLOCALE) // Buscar forma de hacerlo
  // Mejor dejar en el servidor hora UTF y en el cliente mostrarlo con locale
  const endDate = new Date();
  endDate.setHours(now.getHours() + 1);

  const auction = {
    id: uuid(),
    title,
    status: "OPEN",
    createdAt: now.toISOString(),
    endingAt: endDate.toISOString(),
    highestBid: {
      amount: 0,
    },
    seller: email,
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

export const handler = commonMiddleware(createAuction).use(
  validator({
    inputSchema: createAuctionSchema,
    ajvOptions: {
      useDefaults: true,
      strict: false,
    },
  })
);
// https://github.com/codingly-io/course-auction-service/tree/master
