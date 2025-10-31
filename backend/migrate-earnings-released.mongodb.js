/**
 * MongoDB Migration Script: Add earningsReleased field to SubOrders
 * 
 * Run this in MongoDB shell or MongoDB Compass:
 * 1. Connect to your database
 * 2. Select the correct database
 * 3. Copy and paste this script into the shell
 * 
 * Or use mongosh:
 * mongosh "your-connection-string" < migrate-earnings-released.mongodb.js
 */

// Use your database name
// use('your-database-name');

print('='.repeat(60));
print('SubOrder earningsReleased Field Migration');
print('='.repeat(60));

// Count total sub-orders
const totalCount = db.suborders.countDocuments({});
print(`\nTotal sub-orders found: ${totalCount}`);

// Update delivered orders - set earningsReleased to true
print('\n1. Setting earningsReleased=true for delivered orders...');
const deliveredResult = db.suborders.updateMany(
  { 
    orderStatus: 'delivered',
    earningsReleased: { $exists: false }
  },
  { 
    $set: { earningsReleased: true } 
  }
);
print(`   Matched: ${deliveredResult.matchedCount}, Modified: ${deliveredResult.modifiedCount}`);

// Update all non-delivered orders - set earningsReleased to false
print('\n2. Setting earningsReleased=false for non-delivered orders...');
const nonDeliveredResult = db.suborders.updateMany(
  { 
    orderStatus: { $ne: 'delivered' },
    earningsReleased: { $exists: false }
  },
  { 
    $set: { earningsReleased: false } 
  }
);
print(`   Matched: ${nonDeliveredResult.matchedCount}, Modified: ${nonDeliveredResult.modifiedCount}`);

// Verify migration
print('\n3. Verification:');
const earningsReleasedCount = db.suborders.countDocuments({ earningsReleased: true });
const earningsNotReleasedCount = db.suborders.countDocuments({ earningsReleased: false });
const missingCount = db.suborders.countDocuments({ earningsReleased: { $exists: false } });

print(`   - earningsReleased = true: ${earningsReleasedCount}`);
print(`   - earningsReleased = false: ${earningsNotReleasedCount}`);
print(`   - missing earningsReleased field: ${missingCount}`);

if (missingCount > 0) {
  print('\n⚠️  Warning: Some documents still missing earningsReleased field!');
} else {
  print('\n✅ Migration completed successfully!');
}

// Show sample data
print('\n4. Sample sub-orders after migration:');
db.suborders.find({})
  .limit(5)
  .forEach(doc => {
    print(`   - ID: ${doc._id}`);
    print(`     Status: ${doc.orderStatus}, Payment: ${doc.paymentStatus}, Earnings Released: ${doc.earningsReleased}`);
    print(`     Delivered At: ${doc.deliveredAt || 'N/A'}`);
    print('');
  });

print('='.repeat(60));
print('Migration script completed');
print('='.repeat(60));
