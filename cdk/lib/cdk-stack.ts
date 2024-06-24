import {aws_cloudfront, aws_iam, aws_s3, aws_s3_deployment, Stack, StackProps} from 'aws-cdk-lib';
import {Construct} from 'constructs';

// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class NodejsAWSShopFrontendStack extends Stack {
    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);

        const cloudfrontOAI = new aws_cloudfront.OriginAccessIdentity(this, 'NodejsAWSShopCloudfrontOAI');

        const siteBucket = new aws_s3.Bucket(this, 'NodejsAWSShopStaticBucket', {
            bucketName: 'programister42-nodejs-aws-shop-static-site',
            websiteIndexDocument: 'index.html',
            blockPublicAccess: aws_s3.BlockPublicAccess.BLOCK_ALL
        });
        siteBucket.addToResourcePolicy(new aws_iam.PolicyStatement({
            actions: ['s3:GetObject'],
            resources: [siteBucket.arnForObjects('*')],
            principals: [new aws_iam.CanonicalUserPrincipal(cloudfrontOAI.cloudFrontOriginAccessIdentityS3CanonicalUserId)]
        }));

        const distribution = new aws_cloudfront.CloudFrontWebDistribution(this, 'NodejsAWSShopCloudfrontDistribution', {
            originConfigs: [{
                s3OriginSource: {
                    s3BucketSource: siteBucket,
                    originAccessIdentity: cloudfrontOAI
                },
                behaviors: [{isDefaultBehavior: true}]
            }],
            errorConfigurations: [
                {
                    errorCode: 403,
                    responseCode: 200,
                    responsePagePath: '/index.html'
                },
                {
                    errorCode: 404,
                    responseCode: 200,
                    responsePagePath: '/index.html'
                }
            ]
        });

        new aws_s3_deployment.BucketDeployment(this, 'NodejsAWSShopBucketDeployment', {
            sources: [aws_s3_deployment.Source.asset('../dist')],
            destinationBucket: siteBucket,
            distribution,
            distributionPaths: ['/*']
        });

    }
}
