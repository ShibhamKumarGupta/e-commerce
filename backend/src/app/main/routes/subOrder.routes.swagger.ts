/**
 * @swagger
 * /sub-orders/seller/my-orders:
 *   get:
 *     tags: [Sub-Orders]
 *     summary: Get seller's sub-orders (Seller/Admin only)
 *     description: Retrieve all sub-orders for the authenticated seller's products
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, processing, shipped, delivered, cancelled]
 *     responses:
 *       200:
 *         description: Sub-orders retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     subOrders:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/SubOrder'
 *                     pagination:
 *                       type: object
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *
 * /sub-orders/seller/earnings:
 *   get:
 *     tags: [Sub-Orders]
 *     summary: Get seller earnings (Seller/Admin only)
 *     description: Calculate total earnings for the seller after platform commission
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Earnings retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalEarnings:
 *                       type: number
 *                       example: 5000.50
 *                     platformCommission:
 *                       type: number
 *                       example: 500.05
 *                     netEarnings:
 *                       type: number
 *                       example: 4500.45
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *
 * /sub-orders/seller/stats:
 *   get:
 *     tags: [Sub-Orders]
 *     summary: Get seller statistics (Seller/Admin only)
 *     description: Get comprehensive statistics for seller's orders
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalOrders:
 *                       type: integer
 *                       example: 50
 *                     totalRevenue:
 *                       type: number
 *                       example: 10000
 *                     pendingOrders:
 *                       type: integer
 *                       example: 5
 *                     completedOrders:
 *                       type: integer
 *                       example: 40
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *
 * /sub-orders/seller/analytics/monthly-revenue:
 *   get:
 *     tags: [Sub-Orders]
 *     summary: Get seller monthly revenue (Seller/Admin only)
 *     description: Get monthly revenue analytics for the seller
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: months
 *         schema:
 *           type: integer
 *           default: 12
 *     responses:
 *       200:
 *         description: Monthly revenue data retrieved successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *
 * /sub-orders/seller/analytics/top-products:
 *   get:
 *     tags: [Sub-Orders]
 *     summary: Get seller's top products (Seller/Admin only)
 *     description: Get list of top selling products for the seller
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Top products retrieved successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *
 * /sub-orders/seller/analytics/orders-by-status:
 *   get:
 *     tags: [Sub-Orders]
 *     summary: Get orders by status (Seller/Admin only)
 *     description: Get breakdown of orders by their status
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Order status breakdown retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       status:
 *                         type: string
 *                         example: delivered
 *                       count:
 *                         type: integer
 *                         example: 25
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *
 * /sub-orders/{id}/status:
 *   patch:
 *     tags: [Sub-Orders]
 *     summary: Update sub-order status (Seller/Admin only)
 *     description: Update the status of a sub-order
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Sub-order ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, processing, shipped, delivered, cancelled]
 *                 example: shipped
 *     responses:
 *       200:
 *         description: Sub-order status updated successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *
 * /sub-orders/{id}/approval:
 *   patch:
 *     tags: [Sub-Orders]
 *     summary: Update seller approval (Seller/Admin only)
 *     description: Approve or reject a sub-order
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Sub-order ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - approved
 *             properties:
 *               approved:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: Approval status updated successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *
 * /sub-orders/admin/all:
 *   get:
 *     tags: [Sub-Orders]
 *     summary: Get all sub-orders (Admin only)
 *     description: Retrieve all sub-orders in the system
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Sub-orders retrieved successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *
 * /sub-orders/admin/commission-breakdown:
 *   get:
 *     tags: [Sub-Orders]
 *     summary: Get commission breakdown (Admin only)
 *     description: Get platform commission breakdown from all sub-orders
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Commission breakdown retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalCommission:
 *                       type: number
 *                       example: 2500.50
 *                     totalSubOrderValue:
 *                       type: number
 *                       example: 25000
 *                     averageCommissionRate:
 *                       type: number
 *                       example: 10
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *
 * /sub-orders/{id}:
 *   get:
 *     tags: [Sub-Orders]
 *     summary: Get sub-order by ID
 *     description: Retrieve detailed information about a specific sub-order
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Sub-order ID
 *     responses:
 *       200:
 *         description: Sub-order retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/SubOrder'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
