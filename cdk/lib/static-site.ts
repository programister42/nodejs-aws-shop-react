import {Construct} from 'constructs';
import {aws_s3, aws_iam, aws_cloudfront, aws_s3_deployment, Stack} from 'aws-cdk-lib';

export class StaticSite extends Construct {
    constructor(parent: Stack, name: string) {
        super(parent, name);

        const cloudfrontOAI = new aws_cloudfront.OriginAccessIdentity(this, 'programister42-cloudfront-oai');

        const siteBucket = new aws_s3.Bucket(this, 'programister42-static-bucket', {
            bucketName: 'programister42-nodejs-aws-shop-react-cdk',
            websiteIndexDocument: 'index.html',
            blockPublicAccess: aws_s3.BlockPublicAccess.BLOCK_ALL
        });

        siteBucket.addToResourcePolicy(new aws_iam.PolicyStatement({
            actions: ['s3:GetObject'],
            resources: [siteBucket.arnForObjects('*')],
            principals: [new aws_iam.CanonicalUserPrincipal(cloudfrontOAI.cloudFrontOriginAccessIdentityS3CanonicalUserId)]
        }));

        const distribution = new aws_cloudfront.CloudFrontWebDistribution(this, 'programister42-cloudfront-distribution', {
            originConfigs: [{
                s3OriginSource: {
                    s3BucketSource: siteBucket,
                    originAccessIdentity: cloudfrontOAI
                },
                behaviors: [{isDefaultBehavior: true}]
            }]
        });

        new aws_s3_deployment.BucketDeployment(this, 'programister42-static-bucket-deployment', {
            sources: [aws_s3_deployment.Source.asset('../dist')],
            destinationBucket: siteBucket,
            distribution,
            distributionPaths: ['/*']
        });
    }
}
