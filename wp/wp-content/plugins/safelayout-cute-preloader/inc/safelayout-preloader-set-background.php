<?php
defined( 'ABSPATH' ) || exit; // Exit if accessed directly.

if ( ! function_exists( 'safelayout_preloader_set_background' ) ) {

	// Return background css
	function safelayout_preloader_set_background( $options ) {
		?>
		.sl-pl-back {
			pointer-events: auto;
			position: fixed;
			transition: all 0.5s cubic-bezier(0.645, 0.045, 0.355, 1) 0s;
		}
		<?php
		switch ( $options ) {
			case 'fade':
				?>
				.sl-pl-back-fade {
					height: 100%;
					left: 0;
					top: 0;
					width: 100%;
				}
				.sl-pl-loaded .sl-pl-back-fade {
					opacity: 0 !important;
				}
				<?php
				break;
			case 'to-left':
				?>
				.sl-pl-back-to-left {
					height: 100%;
					left: 0;
					top: 0;
					width: 100%;
				}
				.sl-pl-loaded .sl-pl-back-to-left {
					transform: translateX(-101vw);
					-webkit-transform: translateX(-101vw);
				}
				<?php
				break;
			case 'to-right':
				?>
				.sl-pl-back-to-right {
					height: 100%;
					left: 0;
					top: 0;
					width: 100%;
				}
				.sl-pl-loaded .sl-pl-back-to-right {
					transform: translateX(101vw);
					-webkit-transform: translateX(101vw);
				}
				<?php
				break;
			case 'to-top':
				?>
				.sl-pl-back-to-top {
					height: 100%;
					left: 0;
					top: 0;
					width: 100%;
				}
				.sl-pl-loaded .sl-pl-back-to-top {
					transform: translateY(-101vh);
					-webkit-transform: translateY(-101vh);
				}
				<?php
				break;
			case 'to-bottom':
				?>
				.sl-pl-back-to-bottom {
					height: 100%;
					left: 0;
					top: 0;
					width: 100%;
				}
				.sl-pl-loaded .sl-pl-back-to-bottom {
					transform: translateY(101vh);
					-webkit-transform: translateY(101vh);
				}
				<?php
				break;
			case 'ellipse-bottom':
				?>
				.sl-pl-back-ellipse-bottom {
					height: 100%;
					left: 0;
					top: 0;
					width: 100%;
				}
				.sl-pl-back-ellipse-bottom {
					clip-path: ellipse(150% 150% at 100% 100%);
					-webkit-clip-path: ellipse(150% 150% at 100% 100%);
				}
				.sl-pl-loaded .sl-pl-back-ellipse-bottom {
					clip-path: ellipse(0 0 at 100% 100%);
					-webkit-clip-path: ellipse(0 0 at 100% 100%);
				}
				<?php
				break;
			case 'ellipse-top':
				?>
				.sl-pl-back-ellipse-top {
					height: 100%;
					left: 0;
					top: 0;
					width: 100%;
				}
				.sl-pl-back-ellipse-top {
					clip-path: ellipse(150% 150% at 0 0);
					-webkit-clip-path: ellipse(150% 150% at 0 0);
				}
				.sl-pl-loaded .sl-pl-back-ellipse-top {
					clip-path: ellipse(0 0 at 0 0);
					-webkit-clip-path: ellipse(0 0 at 0 0);
				}
				<?php
				break;
			case 'ellipse-left':
				?>
				.sl-pl-back-ellipse-left {
					height: 100%;
					left: 0;
					top: 0;
					width: 100%;
				}
				.sl-pl-back-ellipse-left {
					clip-path: ellipse(150% 150% at 0 100%);
					-webkit-clip-path: ellipse(150% 150% at 0 100%);
				}
				.sl-pl-loaded .sl-pl-back-ellipse-left {
					clip-path: ellipse(0 0 at 0 100%);
					-webkit-clip-path: ellipse(0 0 at 0 100%);
				}
				<?php
				break;
			case 'ellipse-right':
				?>
				.sl-pl-back-ellipse-right {
					height: 100%;
					left: 0;
					top: 0;
					width: 100%;
				}
				.sl-pl-back-ellipse-right {
					clip-path: ellipse(150% 150% at 100% 0);
					-webkit-clip-path: ellipse(150% 150% at 100% 0);
				}
				.sl-pl-loaded .sl-pl-back-ellipse-right {
					clip-path: ellipse(0 0 at 100% 0);
					-webkit-clip-path: ellipse(0 0 at 100% 0);
				}
				<?php
				break;
			case 'rect':
				?>
				.sl-pl-back-rect {
					height: 100%;
					left: 0;
					top: 0;
					width: 100%;
				}
				.sl-pl-loaded .sl-pl-back-rect {
					transform: scale(0);
					-webkit-transform: scale(0);
				}
				<?php
				break;
			case 'diamond':
				?>
				.sl-pl-back-diamond {
					height: 100%;
					left: 0;
					top: 0;
					width: 100%;
				}
				.sl-pl-back-diamond {
					clip-path: polygon(-50% 50%, 50% -50%, 150% 50%, 50% 150%);
					-webkit-clip-path: polygon(-50% 50%, 50% -50%, 150% 50%, 50% 150%);
				}
				.sl-pl-loaded .sl-pl-back-diamond {
					clip-path: polygon(50% 50%, 50% 50%, 50% 50%, 50% 50%);
					-webkit-clip-path: polygon(50% 50%, 50% 50%, 50% 50%, 50% 50%);
				}
				<?php
				break;
			case 'circle':
				?>
				.sl-pl-back-circle {
					height: 100%;
					left: 0;
					top: 0;
					width: 100%;
				}
				.sl-pl-back-circle {
					clip-path: circle(75%);
					-webkit-clip-path: circle(75%);
				}
				.sl-pl-loaded .sl-pl-back-circle {
					clip-path: circle(0);
					-webkit-clip-path: circle(0);
				}
				<?php
				break;
			case 'tear-vertical':
				?>
				.sl-pl-back-tear-vertical-left {
					height: 100%;
					left: 0;
					top: 0;
					width: 50%;
				}
				.sl-pl-back-tear-vertical-right {
					height: 100%;
					left: 50%;
					top: 0;
					width: 50%;
				}
				.sl-pl-loaded .sl-pl-back-tear-vertical-left {
					transform: translateY(-101vh);
					-webkit-transform: translateY(-101vh);
				}
				.sl-pl-loaded .sl-pl-back-tear-vertical-right {
					transform: translateY(101vh);
					-webkit-transform: translateY(101vh);
				}
				<?php
				break;
			case 'split-horizontal':
				?>
				.sl-pl-back-split-horizontal-left {
					height: 100%;
					left: 0;
					top: 0;
					width: 50%;
				}
				.sl-pl-back-split-horizontal-right {
					height: 100%;
					left: 50%;
					top: 0;
					width: 50%;
				}
				.sl-pl-loaded .sl-pl-back-split-horizontal-left {
					transform: translateX(-51vw);
					-webkit-transform: translateX(-51vw);
				}
				.sl-pl-loaded .sl-pl-back-split-horizontal-right {
					transform: translateX(51vw);
					-webkit-transform: translateX(51vw);
				}
				<?php
				break;
			case 'tear-horizontal':
				?>
				.sl-pl-back-tear-horizontal-top {
					height: 50%;
					left: 0;
					top: 0;
					width: 100%;
				}
				.sl-pl-back-tear-horizontal-bottom {
					height: 50%;
					left: 0;
					top: 50%;
					width: 100%;
				}
				.sl-pl-loaded .sl-pl-back-tear-horizontal-top {
					transform: translateX(-101vw);
					-webkit-transform: translateX(-101vw);
				}
				.sl-pl-loaded .sl-pl-back-tear-horizontal-bottom {
					transform: translateX(101vw);
					-webkit-transform: translateX(101vw);
				}
				<?php
				break;
			case 'split-vertical':
				?>
				.sl-pl-back-split-vertical-top {
					height: 50%;
					left: 0;
					top: 0;
					width: 100%;
				}
				.sl-pl-back-split-vertical-bottom {
					height: 50%;
					left: 0;
					top: 50%;
					width: 100%;
				}
				.sl-pl-loaded .sl-pl-back-split-vertical-top {
					transform: translateY(-51vh);
					-webkit-transform: translateY(-51vh);
				}
				.sl-pl-loaded .sl-pl-back-split-vertical-bottom {
					transform: translateY(51vh);
					-webkit-transform: translateY(51vh);
				}
				<?php
				break;
			case 'linear-left':
				?>
				.sl-pl-back-linear-left {
					height: 100%;
					left: 0;
					top: 0;
					width: 100%;
				}
				.sl-pl-back-linear-left div {
					display: inline-block;
					height: 100%;
					transition: all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1) 0s, background 0s;
					width: 10%;
				}
				.sl-pl-loaded .sl-pl-back-linear-left div {
					opacity: 0 !important;
				}
				.sl-pl-loaded .sl-pl-back-linear-left div:nth-child(2) {
					transition-delay: 0.025s;
				}
				.sl-pl-loaded .sl-pl-back-linear-left div:nth-child(3) {
					transition-delay: 0.05s;
				}
				.sl-pl-loaded .sl-pl-back-linear-left div:nth-child(4) {
					transition-delay: 0.075s;
				}
				.sl-pl-loaded .sl-pl-back-linear-left div:nth-child(5) {
					transition-delay: 0.1s;
				}
				.sl-pl-loaded .sl-pl-back-linear-left div:nth-child(6) {
					transition-delay: 0.125s;
				}
				.sl-pl-loaded .sl-pl-back-linear-left div:nth-child(7) {
					transition-delay: 0.15s;
				}
				.sl-pl-loaded .sl-pl-back-linear-left div:nth-child(8) {
					transition-delay: 0.175s;
				}
				.sl-pl-loaded .sl-pl-back-linear-left div:nth-child(9) {
					transition-delay: 0.2s;
				}
				.sl-pl-loaded .sl-pl-back-linear-left div:nth-child(10) {
					transition-delay: 0.225s;
				}
				<?php
				break;
			case 'linear-right':
				?>
				.sl-pl-back-linear-right {
					height: 100%;
					left: 0;
					top: 0;
					width: 100%;
				}
				.sl-pl-back-linear-right div {
					display: inline-block;
					height: 100%;
					transition: all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1) 0s, background 0s;
					width: 10%;
				}
				.sl-pl-loaded .sl-pl-back-linear-right div {
					opacity: 0 !important;
				}
				.sl-pl-loaded .sl-pl-back-linear-right div:nth-child(9) {
					transition-delay: 0.025s;
				}
				.sl-pl-loaded .sl-pl-back-linear-right div:nth-child(8) {
					transition-delay: 0.05s;
				}
				.sl-pl-loaded .sl-pl-back-linear-right div:nth-child(7) {
					transition-delay: 0.075s;
				}
				.sl-pl-loaded .sl-pl-back-linear-right div:nth-child(6) {
					transition-delay: 0.1s;
				}
				.sl-pl-loaded .sl-pl-back-linear-right div:nth-child(5) {
					transition-delay: 0.125s;
				}
				.sl-pl-loaded .sl-pl-back-linear-right div:nth-child(4) {
					transition-delay: 0.15s;
				}
				.sl-pl-loaded .sl-pl-back-linear-right div:nth-child(3) {
					transition-delay: 0.175s;
				}
				.sl-pl-loaded .sl-pl-back-linear-right div:nth-child(2) {
					transition-delay: 0.2s;
				}
				.sl-pl-loaded .sl-pl-back-linear-right div:nth-child(1) {
					transition-delay: 0.225s;
				}
				<?php
				break;
		}//end of switch
	}
}