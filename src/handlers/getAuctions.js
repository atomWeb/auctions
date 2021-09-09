import AWS from "aws-sdk";
import validator from "@middy/validator";
import commonMiddleware from "../lib/commonMiddleware";
import getAuctionsSchema from "../lib/schemas/getAuctionsSchema";
import createError from "http-errors";

const dynamodb = new AWS.DynamoDB.DocumentClient();

async function getAuctions(event, context) {
  const { status } = event.queryStringParameters;
  let auctions;

  // if (!status) {
  //   // Esto se puede validar con los schemas, ya que se define obligatorio
  //   // y si no esta informado le pone por defecto OPEN
  //   try {
  //     const result = await dynamodb
  //       .scan({
  //         TableName: process.env.AUCTIONS_TABLE,
  //       })
  //       .promise();
  //     auctions = result.Items;
  //   } catch (error) {
  //     console.error(error);
  //     throw new createError.InternalServerError(error);
  //   }
  // } else {
    const params = {
      TableName: process.env.AUCTIONS_TABLE,
      IndexName: "statusAndEndDate",
      KeyConditionExpression: "#status = :status",
      ExpressionAttributeValues: {
        ":status": status,
      },
      ExpressionAttributeNames: {
        "#status": "status",
      },
    };

    try {
      const result = await dynamodb.query(params).promise();

      auctions = result.Items;
    } catch (error) {
      console.error(error);
      throw new createError.InternalServerError(error);
    }
  // }

  return {
    statusCode: 200,
    body: JSON.stringify(auctions),
  };
}

export const handler = commonMiddleware(getAuctions).use(
  validator({
    inputSchema: getAuctionsSchema,
    ajvOptions: {
      useDefaults: true,
      strict: false,
    },
  })
);
