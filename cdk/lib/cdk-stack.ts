import {Stack, StackProps} from 'aws-cdk-lib';
import {Construct} from 'constructs';

import {StaticSite} from './static-site';

// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class CdkStack extends Stack {
    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);

        const staticSite = new StaticSite(this, 'programister42-static-site');
    }
}
