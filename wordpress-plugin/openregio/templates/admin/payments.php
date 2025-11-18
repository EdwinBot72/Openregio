<?php
/**
 * Admin Template: Payments overview
 *
 * @package OpenRegio
 */

if (!defined('ABSPATH')) {
    exit;
}

global $wpdb;
$table_name = $wpdb->prefix . 'openregio_pending_payments';

$payments = $wpdb->get_results("SELECT * FROM $table_name ORDER BY created_at DESC LIMIT 100");
?>

<div class="wrap">
    <h1><?php _e('OpenRegio Betalingen', 'openregio'); ?></h1>
    
    <table class="wp-list-table widefat fixed striped">
        <thead>
            <tr>
                <th><?php _e('ID', 'openregio'); ?></th>
                <th><?php _e('E-mail', 'openregio'); ?></th>
                <th><?php _e('Plan', 'openregio'); ?></th>
                <th><?php _e('Mollie Payment ID', 'openregio'); ?></th>
                <th><?php _e('Status', 'openregio'); ?></th>
                <th><?php _e('Datum', 'openregio'); ?></th>
            </tr>
        </thead>
        <tbody>
            <?php if (!empty($payments)): ?>
                <?php foreach ($payments as $payment): ?>
                    <tr>
                        <td><?php echo esc_html($payment->id); ?></td>
                        <td><?php echo esc_html($payment->email); ?></td>
                        <td>
                            <span class="openregio-plan-badge openregio-plan-<?php echo esc_attr($payment->plan); ?>">
                                <?php echo esc_html(ucfirst($payment->plan)); ?>
                            </span>
                        </td>
                        <td>
                            <code><?php echo esc_html($payment->mollie_payment_id ?: '-'); ?></code>
                        </td>
                        <td>
                            <?php
                            $status_colors = array(
                                'pending' => 'orange',
                                'completed' => 'green',
                                'failed' => 'red',
                                'expired' => 'gray',
                                'canceled' => 'gray'
                            );
                            $color = isset($status_colors[$payment->status]) ? $status_colors[$payment->status] : 'black';
                            ?>
                            <span style="color: <?php echo esc_attr($color); ?>">
                                <?php echo esc_html(ucfirst($payment->status)); ?>
                            </span>
                        </td>
                        <td><?php echo esc_html(date_i18n(get_option('date_format') . ' ' . get_option('time_format'), strtotime($payment->created_at))); ?></td>
                    </tr>
                <?php endforeach; ?>
            <?php else: ?>
                <tr>
                    <td colspan="6"><?php _e('Nog geen betalingen.', 'openregio'); ?></td>
                </tr>
            <?php endif; ?>
        </tbody>
    </table>
    
    <p class="description">
        <?php _e('Alleen de laatste 100 betalingen worden getoond.', 'openregio'); ?>
    </p>
</div>

<style>
.openregio-plan-badge {
    display: inline-block;
    padding: 3px 8px;
    border-radius: 3px;
    font-size: 11px;
    font-weight: bold;
}
.openregio-plan-basic {
    background: #e3f2fd;
    color: #1976d2;
}
.openregio-plan-pro {
    background: #f3e5f5;
    color: #7b1fa2;
}
</style>
