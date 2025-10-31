/**
 * Migration Script: Add earningsReleased field to existing SubOrders
 * 
 * This script updates existing sub-orders to set the earningsReleased flag
 * based on their current delivery status.
 * 
 * Run this after deploying the code changes to update existing data.
 */

import mongoose from 'mongoose';
import { config } from './src/app/config/environment.config';

declare const process: any;

async function migrateEarningsReleased() {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(config.mongodb.uri);
    console.log('Connected successfully!');

    const SubOrderModel = mongoose.model('SubOrder');

    // Count total sub-orders
    const totalCount = await SubOrderModel.countDocuments({});
    console.log(`Total sub-orders found: ${totalCount}`);

    // Update delivered orders with paid status - set earningsReleased to true
    console.log('\n1. Setting earningsReleased=true for delivered orders...');
    const deliveredResult = await SubOrderModel.updateMany(
      { 
        orderStatus: 'delivered',
        earningsReleased: { $exists: false }
      },
      { 
        $set: { earningsReleased: true } 
      }
    );
    console.log(`   Updated ${deliveredResult.modifiedCount} delivered orders`);

    // Update all non-delivered orders - set earningsReleased to false
    console.log('\n2. Setting earningsReleased=false for non-delivered orders...');
    const nonDeliveredResult = await SubOrderModel.updateMany(
      { 
        orderStatus: { $ne: 'delivered' },
        earningsReleased: { $exists: false }
      },
      { 
        $set: { earningsReleased: false } 
      }
    );
    console.log(`   Updated ${nonDeliveredResult.modifiedCount} non-delivered orders`);

    // Verify migration
    console.log('\n3. Verification:');
    const earningsReleasedCount = await SubOrderModel.countDocuments({ earningsReleased: true });
    const earningsNotReleasedCount = await SubOrderModel.countDocuments({ earningsReleased: false });
    const missingCount = await SubOrderModel.countDocuments({ earningsReleased: { $exists: false } });

    console.log(`   - earningsReleased = true: ${earningsReleasedCount}`);
    console.log(`   - earningsReleased = false: ${earningsNotReleasedCount}`);
    console.log(`   - missing earningsReleased field: ${missingCount}`);

    if (missingCount > 0) {
      console.log('\n⚠️  Warning: Some documents still missing earningsReleased field!');
    } else {
      console.log('\n✅ Migration completed successfully!');
    }

    // Show sample data
    console.log('\n4. Sample sub-orders after migration:');
    const samples = await SubOrderModel.find({})
      .select('orderStatus paymentStatus earningsReleased deliveredAt')
      .limit(5)
      .lean();
    
    samples.forEach((sample: any) => {
      console.log(`   - ID: ${sample._id}`);
      console.log(`     Status: ${sample.orderStatus}, Payment: ${sample.paymentStatus}, Earnings Released: ${sample.earningsReleased}`);
      console.log(`     Delivered At: ${sample.deliveredAt || 'N/A'}`);
    });

    await mongoose.connection.close();
    console.log('\nDatabase connection closed.');
    
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

// Run migration
console.log('='.repeat(60));
console.log('SubOrder earningsReleased Field Migration');
console.log('='.repeat(60));
migrateEarningsReleased();
