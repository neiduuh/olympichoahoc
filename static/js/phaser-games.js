(function(){
  'use strict';
  if (!window.Phaser) {
    window.ChemGames = { ready:false, error:'Phaser.js chưa tải được.' };
    return;
  }

  const Phaser = window.Phaser;
  const W = 960, H = 500;
  const C = {
    navy: 0x081b2b, navy2: 0x0d2d45, white: 0xf7fbff, ink: 0x142533,
    cyan: 0x58d6ff, sky: 0x78d7ff, grass: 0x58b957, grass2: 0x2f7e45,
    yellow: 0xffd43b, amber: 0xffa928, orange: 0xf47b20, red: 0xe44c58,
    blue: 0x2d75d8, green: 0x29b66f, teal: 0x26c6a2, purple: 0x7559d9,
    gray: 0x5a6976, lightGray: 0xdbe5ec, darkGray: 0x2d3339, road: 0x353b42,
    wood: 0x9b6138, honey: 0xf4ad1a
  };

  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  const labelStyle=(size=24,color='#ffffff',weight='700')=>({
    fontFamily:'Arial, sans-serif', fontSize:`${size}px`, fontStyle:weight==='700'?'bold':'normal',
    color, stroke:'#06131d', strokeThickness:size>=28?5:3, align:'center'
  });

  class MainScene extends Phaser.Scene {
    constructor(){ super('Main'); this.mode=null; this.refs={}; this.onDirection=null; }
    create(){
      this.cameras.main.setBackgroundColor('#071a28');
      this.makeTextures();
      this.drawLoading();
      this.game.events.emit('chem-ready');
    }
    clearScene(){
      this.tweens.killAll();
      this.time.removeAllEvents();
      this.children.removeAll(true);
      this.refs={}; this.onDirection=null;
      this.cameras.main.setZoom(1); this.cameras.main.setScroll(0,0); this.cameras.main.setRotation(0);
    }
    drawLoading(){
      this.clearScene();
      this.add.rectangle(W/2,H/2,W,H,C.navy);
      this.add.text(W/2,H/2-8,'OLYMPIC HÓA HỌC',labelStyle(36,'#ffd43b')).setOrigin(.5);
      this.add.text(W/2,H/2+44,'Sẵn sàng cho thử thách',labelStyle(19,'#d7ebf7','400')).setOrigin(.5);
    }
    makeTextures(){
      if(this.textures.exists('beeTex')) return;
      let g=this.make.graphics({x:0,y:0,add:false});
      // Bee
      g.fillStyle(0xffffff,.72); g.fillEllipse(25,22,34,22); g.fillEllipse(60,22,34,22);
      g.lineStyle(3,0xd8edf5,.9); g.strokeEllipse(25,22,34,22); g.strokeEllipse(60,22,34,22);
      g.fillStyle(C.yellow,1); g.fillEllipse(45,42,58,39); g.lineStyle(3,0x17222b,1); g.strokeEllipse(45,42,58,39);
      g.fillStyle(0x17222b,1); g.fillRect(35,25,8,33); g.fillRect(51,25,8,33);
      g.fillStyle(C.yellow,1); g.fillCircle(72,39,20); g.lineStyle(3,0x17222b,1); g.strokeCircle(72,39,20);
      g.fillStyle(0x17222b,1); g.fillCircle(78,34,3); g.fillCircle(84,42,2);
      g.lineStyle(3,0x17222b,1); g.beginPath();g.moveTo(69,22);g.lineTo(62,8);g.moveTo(78,21);g.lineTo(86,8);g.strokePath();
      g.generateTexture('beeTex',96,76); g.clear();
      // Soccer ball
      g.fillStyle(0xffffff,1); g.fillCircle(32,32,28); g.lineStyle(3,0x1a242c,1); g.strokeCircle(32,32,28);
      g.fillStyle(0x192126,1); g.fillCircle(32,31,8); [0,72,144,216,288].forEach(a=>{const r=18,rad=Phaser.Math.DegToRad(a);g.fillCircle(32+Math.cos(rad)*r,32+Math.sin(rad)*r,5)});
      g.generateTexture('soccerBall',64,64); g.clear();
      // Basketball
      g.fillStyle(0xf28b25,1); g.fillCircle(32,32,29); g.lineStyle(3,0x3b2a1d,1); g.strokeCircle(32,32,29); g.lineStyle(3,0x3b2a1d,1);
      g.beginPath();g.moveTo(4,32);g.lineTo(60,32);g.moveTo(32,3);g.lineTo(32,61);g.strokePath();
      g.beginPath();g.arc(5,32,35,-.75,.75);g.strokePath();g.beginPath();g.arc(59,32,35,2.39,3.89);g.strokePath();
      g.generateTexture('basketBall',64,64);g.clear();
      // Coin/star sparkle
      g.fillStyle(C.yellow,1); const pts=[]; for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,r=i%2?5:11;pts.push(new Phaser.Geom.Point(12+Math.cos(a)*r,12+Math.sin(a)*r));}
      g.fillPoints(pts,true); g.generateTexture('spark',24,24);g.destroy();
    }
    addSky(top=0x70d5ff,bottom=0xc8f1ff){
      const bands=18, bh=H*0.64/bands;
      const g=this.add.graphics();
      const tr=Phaser.Display.Color.IntegerToColor(top), br=Phaser.Display.Color.IntegerToColor(bottom);
      for(let i=0;i<bands;i++){
        const c=Phaser.Display.Color.Interpolate.ColorWithColor(tr,br,bands-1,i);
        g.fillStyle(Phaser.Display.Color.GetColor(c.r,c.g,c.b),1); g.fillRect(0,i*bh,W,bh+1);
      }
      this.add.circle(805,78,44,0xffe66d,.95);
      for(let i=0;i<5;i++){
        const x=120+i*185,y=58+(i%2)*42; const cloud=this.add.container(x,y).setAlpha(.72);
        cloud.add([this.add.circle(0,8,22,0xffffff),this.add.circle(24,0,28,0xffffff),this.add.circle(52,10,20,0xffffff),this.add.rectangle(25,14,76,28,0xffffff)]);
      }
    }
    drawHills(){
      const g=this.add.graphics();
      g.fillStyle(0x8fc66e,1); g.fillTriangle(0,330,215,130,430,330); g.fillTriangle(255,330,520,110,760,330); g.fillTriangle(600,330,810,155,1020,330);
      g.fillStyle(0x6aa259,1); g.fillTriangle(-70,340,120,180,320,340); g.fillTriangle(460,340,700,155,980,340);
      g.fillStyle(0xffffff,.82); g.fillTriangle(152,190,215,130,278,190);g.fillTriangle(458,177,520,110,588,185);g.fillTriangle(754,205,810,155,866,205);
    }
    addHeader(title, subtitle, accent=C.yellow){
      this.add.rectangle(24,20,420,66,0x061724,.78).setOrigin(0).setStrokeStyle(2,0xffffff,.12);
      this.add.rectangle(24,20,8,66,accent,1).setOrigin(0);
      this.add.text(50,31,title,{...labelStyle(25,'#ffffff'),strokeThickness:3}).setOrigin(0,0);
      this.add.text(50,61,subtitle,{fontFamily:'Arial',fontSize:'15px',color:'#c8dfed'}).setOrigin(0,0);
    }
    makeButton(x,y,label,dir,blocked,selected){
      const fill=blocked?0x5d6670:(selected?C.yellow:0x0d3854), txt=blocked?'×':label;
      const bg=this.add.rectangle(x,y,62,56,fill,.98).setStrokeStyle(3,blocked?0x85909a:0x77bddb,.95).setDepth(41);
      const t=this.add.text(x,y-2,txt,{...labelStyle(30,blocked?'#d8dde1':selected?'#142533':'#ffffff'),strokeThickness:0}).setOrigin(.5).setDepth(42);
      const obj={list:[bg,t],x,y,dir};
      if(!blocked){
        bg.setInteractive({useHandCursor:true});
        bg.on('pointerover',()=>{if(!this.refs.beeDirectionLocked){bg.setScale(1.08);t.setScale(1.08);}});
        bg.on('pointerout',()=>{bg.setScale(1);t.setScale(1);});
        bg.on('pointerdown',()=>{
          if(this.refs.beeDirectionLocked)return;
          this.selectDirection(dir);
          if(this.onDirection)this.onDirection(dir);
        });
      }
      return obj;
    }
    selectDirection(dir){
      this.refs.selectedDir=dir;
      ['up','down','left','right'].forEach(d=>{
        const obj=this.refs.dirButtons?.[d]; if(!obj)return;
        const bg=obj.list[0], txt=obj.list[1]; const blocked=this.refs.blocked?.includes(d);
        if(blocked)return;
        bg.setFillStyle(d===dir?C.yellow:0x0d3854,1); txt.setColor(d===dir?'#142533':'#ffffff');
      });
    }

    showBee(o={}){
      this.clearScene();
      this.mode='bee';
      this.addSky(0x79d4ff,0xcff4ff);
      const g=this.add.graphics();
      g.fillStyle(0x79c35e,1); g.fillRect(0,360,W,140);
      g.fillStyle(0x65ad4f,1); g.fillRect(0,412,W,88);
      // wooden frame board
      const board={x:205,y:70,w:560,h:360,cell:52,cols:7,rows:6};
      this.refs.beeBoard=board;
      g.fillStyle(0x8f5b2f,1); g.fillRoundedRect(board.x-18,board.y-18,board.w+36,board.h+36,12);
      g.fillStyle(0x6d431f,1); g.fillRoundedRect(board.x-12,board.y-12,board.w+24,board.h+24,10);
      g.fillStyle(0x4d2f17,1); g.fillRect(board.x,board.y,board.w,board.h);
      // top info panel similar reference
      this.add.rectangle(215,12,240,48,0x1d2f42,.94).setOrigin(0).setStrokeStyle(3,0xf0d08b,.9);
      this.add.text(235,26,'ONG TÌM MẬT',{fontFamily:'Arial',fontSize:'24px',fontStyle:'bold',color:'#ffffff'});
      this.add.text(235,49,'Chọn 1 hướng rồi trả lời đúng để di chuyển',{fontFamily:'Arial',fontSize:'13px',color:'#d5efff'});
      this.add.rectangle(702,12,120,48,0x1d2f42,.94).setOrigin(0).setStrokeStyle(3,0xf0d08b,.9);
      this.add.text(762,27,'TIẾN ĐỘ',{fontFamily:'Arial',fontSize:'12px',fontStyle:'bold',color:'#d8eefe'}).setOrigin(.5,0);
      this.add.text(762,44,`${(o.step||0)+1}/7`,{fontFamily:'Arial',fontSize:'22px',fontStyle:'bold',color:'#ffd43b'}).setOrigin(.5,0);

      // decorative field around board
      for(let i=0;i<10;i++){
        const x=35+i*93;
        this.add.circle(x,380+((i%3)*16),5,[0xffef87,0xff96b2,0xffffff][i%3],1);
        this.add.circle(x+7,383+((i%3)*16),4,[0xffffff,0xffef87,0xff96b2][i%3],1);
      }
      const progressPath=[{c:0,r:3},{c:1,r:3},{c:1,r:2},{c:2,r:2},{c:3,r:2},{c:4,r:2},{c:5,r:1}];
      const step=clamp(o.step||0,0,progressPath.length-1);
      const cellCenter=(c,r)=>({x:board.x+c*board.cell+board.cell/2,y:board.y+r*board.cell+board.cell/2});
      const current=progressPath[step];
      this.refs.beeCell=current;
      // grid lines
      g.lineStyle(2,0x7a5637,.65);
      for(let c=0;c<=board.cols;c++){g.beginPath();g.moveTo(board.x+c*board.cell,board.y);g.lineTo(board.x+c*board.cell,board.y+board.h);g.strokePath();}
      for(let r=0;r<=board.rows;r++){g.beginPath();g.moveTo(board.x,board.y+r*board.cell);g.lineTo(board.x+board.w,board.y+r*board.cell);g.strokePath();}

      // fixed decorative rock cells
      const rockCells=[[2,0],[4,0],[6,0],[0,1],[3,1],[5,1],[2,3],[4,3],[6,3],[1,4],[3,4],[5,4],[0,5],[2,5],[4,5]];
      const dirInfo={up:[0,-1,'↑'],down:[0,1,'↓'],left:[-1,0,'←'],right:[1,0,'→']};
      const targetCells={};
      Object.entries(dirInfo).forEach(([dir,[dx,dy]])=>{targetCells[dir]={c:current.c+dx,r:current.r+dy};});
      // remove conflicts near current path visuals
      const reserved=new Set([`${current.c},${current.r}`]);
      Object.values(targetCells).forEach(p=>reserved.add(`${p.c},${p.r}`));
      const hiveCell={c:6,r:5};
      reserved.add(`${hiveCell.c},${hiveCell.r}`);
      rockCells.forEach(([c,r])=>{
        if(reserved.has(`${c},${r}`)) return;
        const pt=cellCenter(c,r);
        const rg=this.add.graphics();
        rg.fillStyle(0x98a0a8,1); rg.fillCircle(pt.x,pt.y,17);
        rg.fillStyle(0xb8c0c7,1); rg.fillCircle(pt.x-7,pt.y-6,6); rg.fillCircle(pt.x+4,pt.y+2,5);
        rg.lineStyle(2,0x7b848b,.8); rg.strokeCircle(pt.x,pt.y,17);
      });
      // path dots / collected honey gems
      progressPath.forEach((p,i)=>{
        const pt=cellCenter(p.c,p.r);
        if(i<step){this.add.circle(pt.x,pt.y,10,0x4fd18d,1).setStrokeStyle(2,0xffffff,.8); this.add.image(pt.x,pt.y,'spark').setScale(.55).setTint(0xffd43b);}
      });
      // honey hive goal
      const hpt=cellCenter(hiveCell.c,hiveCell.r);
      const hive=this.add.container(hpt.x,hpt.y);
      const hg=this.add.graphics();
      hg.fillStyle(C.honey,1);
      [0,1,2].forEach(i=>hg.fillRoundedRect(-22+i*1.5,-22+i*12,44-i*3,16,8));
      hg.fillStyle(0x5e3b17,1); hg.fillEllipse(0,20,16,10);
      hive.add(hg);
      this.add.text(hpt.x,hpt.y+34,'MẬT',{fontFamily:'Arial',fontSize:'11px',fontStyle:'bold',color:'#fff5c8'}).setOrigin(.5);

      // current bee character
      const startPt=cellCenter(current.c,current.r);
      this.refs.beeHome={x:startPt.x,y:startPt.y};
      this.refs.beeDirectionLocked=false;
      // Vòng sáng + nhãn để nhân vật luôn dễ nhận ra trên bàn cờ
      const beeHalo=this.add.circle(startPt.x,startPt.y,31,0xffdf45,.22).setStrokeStyle(3,0xffef8a,.95).setDepth(28);
      this.tweens.add({targets:beeHalo,scale:1.22,alpha:.08,duration:700,yoyo:true,repeat:-1,ease:'Sine.inOut'});
      this.refs.beeHalo=beeHalo;
      const bee=this.createBeeMiner(startPt.x,startPt.y,1.18).setDepth(30); this.refs.bee=bee;
      this.tweens.add({targets:bee,y:bee.y-5,duration:620,yoyo:true,repeat:-1,ease:'Sine.inOut'});
      this.refs.beeLabel=this.add.text(startPt.x,startPt.y-48,'ONG',{fontFamily:'Arial',fontSize:'13px',fontStyle:'bold',color:'#fff7b0',stroke:'#5b3b12',strokeThickness:4}).setOrigin(.5).setDepth(31);

      // available direction target tiles
      this.refs.blocked=o.blocked||[];
      this.refs.selectedDir=o.selected||null;
      this.refs.beeTargets={};
      this.refs.beeTargetTiles={};
      Object.entries(dirInfo).forEach(([dir,[dx,dy,label]])=>{
        const tc=targetCells[dir];
        const valid=tc.c>=0&&tc.c<board.cols&&tc.r>=0&&tc.r<board.rows;
        const blocked=this.refs.blocked.includes(dir) || !valid;
        const pt=valid?cellCenter(tc.c,tc.r):{x:startPt.x+dx*board.cell,y:startPt.y+dy*board.cell};
        this.refs.beeTargets[dir]={x:pt.x,y:pt.y,c:tc.c,r:tc.r,valid};
        if(!valid || blocked){
          const rock=this.add.graphics().setPosition(pt.x,pt.y).setDepth(18);
          rock.fillStyle(0x7e878f,1); rock.fillCircle(0,1,20);
          rock.fillStyle(0xaeb6bd,1); rock.fillCircle(-7,-6,7); rock.fillCircle(5,2,5);
          rock.lineStyle(2,0x676f76,.9); rock.strokeCircle(0,1,20);
          this.refs.beeTargetTiles[dir]={objects:[rock],rock:true};
          return;
        }
        const sq=this.add.rectangle(pt.x,pt.y,43,43,o.selected===dir?0xffc547:0x9f2224,1)
          .setStrokeStyle(3,0xe0b56d,.98).setDepth(19).setInteractive({useHandCursor:true});
        const q=this.add.text(pt.x,pt.y-2,'?',{fontFamily:'Arial',fontSize:'24px',fontStyle:'bold',color:o.selected===dir?'#30210a':'#ffffff'}).setOrigin(.5).setDepth(20);
        const gem=this.add.circle(pt.x+12,pt.y+12,7,0x4cd0ff,1).setStrokeStyle(2,0xffffff,.85).setDepth(21);
        const arrow=this.add.text(pt.x-13,pt.y-14,label,{fontFamily:'Arial',fontSize:'13px',fontStyle:'bold',color:'#fff3a6',stroke:'#6e260e',strokeThickness:3}).setOrigin(.5).setDepth(22);
        sq.on('pointerover',()=>{if(!this.refs.beeDirectionLocked){sq.setScale(1.08);q.setScale(1.08);gem.setScale(1.08);arrow.setScale(1.08);}});
        sq.on('pointerout',()=>{sq.setScale(1);q.setScale(1);gem.setScale(1);arrow.setScale(1);});
        sq.on('pointerdown',()=>{
          if(this.refs.beeDirectionLocked)return;
          this.selectDirection(dir);
          if(this.onDirection)this.onDirection(dir);
        });
        this.refs.beeTargetTiles[dir]={objects:[sq,q,gem,arrow],rock:false};
      });

      // left player info column
      const panelX=18,panelW=158;
      this.add.rectangle(panelX,80,panelW,118,0x6a3414,.95).setOrigin(0).setStrokeStyle(3,0xf0d08b,.85);
      this.add.circle(panelX+79,113,27,0xeef7ff,1).setStrokeStyle(3,0xffffff,.8);
      this.add.circle(panelX+79,109,11,0xa8b7c5,1); this.add.ellipse(panelX+79,137,40,25,0xa8b7c5,1);
      const pname=String(o.playerName||'Thí sinh');
      this.add.text(panelX+79,154,pname.length>19?pname.slice(0,18)+'…':pname,{fontFamily:'Arial',fontSize:'14px',fontStyle:'bold',color:'#ffffff'}).setOrigin(.5);
      this.add.text(panelX+79,175,o.className?`Lớp ${o.className}`:'OLYMPIC HÓA HỌC',{fontFamily:'Arial',fontSize:'11px',color:'#fff0d8'}).setOrigin(.5);
      this.add.rectangle(panelX,206,panelW,82,0x7b4318,.97).setOrigin(0).setStrokeStyle(3,0xf0d08b,.85);
      this.add.text(panelX+18,220,'⏱  THỜI GIAN',{fontFamily:'Arial',fontSize:'13px',fontStyle:'bold',color:'#fff8e7'});
      this.refs.beeTimer=this.add.text(panelX+79,260,this.formatSoccerTime(o.timeLeft??1200),{...labelStyle(28,'#ffd844'),strokeThickness:2}).setOrigin(.5);
      this.add.rectangle(panelX,296,panelW,82,0x6a3414,.97).setOrigin(0).setStrokeStyle(3,0xf0d08b,.85);
      this.add.text(panelX+18,310,'★  ĐIỂM',{fontFamily:'Arial',fontSize:'13px',fontStyle:'bold',color:'#fff8e7'});
      this.refs.beeScore=this.add.text(panelX+79,350,String(o.score??0),{...labelStyle(30,'#ffd844'),strokeThickness:2}).setOrigin(.5);

      // 4 mũi tên nhỏ ngay quanh Ong để thí sinh luôn thấy hướng có thể đi
      const miniDirs={up:[0,-46,'↑'],down:[0,46,'↓'],left:[-46,0,'←'],right:[46,0,'→']};
      Object.entries(miniDirs).forEach(([dir,[dx,dy,symbol]])=>{
        const blocked=this.refs.blocked.includes(dir) || !this.refs.beeTargets?.[dir]?.valid;
        const b=this.add.circle(startPt.x+dx,startPt.y+dy,15,blocked?0x59636c:0x0f6f9c,.95).setStrokeStyle(2,blocked?0x86919a:0xb8efff,1).setDepth(45);
        const t=this.add.text(startPt.x+dx,startPt.y+dy-1,blocked?'×':symbol,{fontFamily:'Arial',fontSize:'20px',fontStyle:'bold',color:'#ffffff'}).setOrigin(.5).setDepth(46);
        if(!blocked){
          b.setInteractive({useHandCursor:true});
          b.on('pointerdown',()=>{if(this.refs.beeDirectionLocked)return;this.selectDirection(dir);if(this.onDirection)this.onDirection(dir);});
          b.on('pointerover',()=>{b.setScale(1.14);t.setScale(1.14);});
          b.on('pointerout',()=>{b.setScale(1);t.setScale(1);});
        }
      });

      // directional arrow buttons on right
      this.refs.dirButtons={};
      const bx=850,by=205;
      this.onDirection=o.onDirection||null;
      this.refs.dirButtons.up=this.makeButton(bx,by-62,'↑','up',this.refs.blocked.includes('up'),o.selected==='up');
      this.refs.dirButtons.left=this.makeButton(bx-66,by,'←','left',this.refs.blocked.includes('left'),o.selected==='left');
      this.refs.dirButtons.right=this.makeButton(bx+66,by,'→','right',this.refs.blocked.includes('right'),o.selected==='right');
      this.refs.dirButtons.down=this.makeButton(bx,by+62,'↓','down',this.refs.blocked.includes('down'),o.selected==='down');
      this.add.text(bx,by+104,'CHỌN HƯỚNG',{fontFamily:'Arial',fontSize:'14px',fontStyle:'bold',color:'#eef9ff'}).setOrigin(.5);
      this.add.text(838,335,`Đường khóa: ${this.refs.blocked.length}/4`,{fontFamily:'Arial',fontSize:'14px',fontStyle:'bold',color:'#ffe0e0'}).setOrigin(.5);

      // footer legend
      this.add.rectangle(240,445,520,38,0x1b2b3a,.72).setOrigin(0).setStrokeStyle(2,0xffffff,.1);
      this.add.text(500,464,'Mỗi lần: chọn ↑ ↓ ← → rồi trả lời đúng để Ong tiến tới ô tiếp theo. Sai sẽ khóa hướng vừa chọn.',{fontFamily:'Arial',fontSize:'13px',color:'#e8f7ff',wordWrap:{width:500}}).setOrigin(.5);
    }


    lockBeeDirections(){
      this.refs.beeDirectionLocked=true;
      Object.values(this.refs.dirButtons||{}).forEach(obj=>{
        const bg=obj?.list?.[0];
        if(bg && bg.input) bg.disableInteractive();
      });
      Object.values(this.refs.beeTargetTiles||{}).forEach(tile=>{
        const sq=tile?.objects?.[0]; if(sq?.input) sq.disableInteractive();
      });
    }
    unlockBeeDirections(){
      this.refs.beeDirectionLocked=false;
      Object.entries(this.refs.dirButtons||{}).forEach(([dir,obj])=>{
        if((this.refs.blocked||[]).includes(dir))return;
        const bg=obj?.list?.[0];
        if(bg) bg.setInteractive({useHandCursor:true});
      });
      Object.entries(this.refs.beeTargetTiles||{}).forEach(([dir,tile])=>{
        if((this.refs.blocked||[]).includes(dir) || tile?.rock)return;
        const sq=tile?.objects?.[0];
        if(sq) sq.setInteractive({useHandCursor:true});
      });
    }
    beeApproachObstacle(dir){
      return new Promise(resolve=>{
        const bee=this.refs.bee, target=this.refs.beeTargets?.[dir];
        if(!bee || !target || !target.valid){ resolve(); return; }
        this.lockBeeDirections();
        this.tweens.killTweensOf(bee);
        const home=this.refs.beeHome||{x:bee.x,y:bee.y};
        const dx=target.x-home.x, dy=target.y-home.y;
        const len=Math.max(1,Math.hypot(dx,dy));
        const stop=24;
        const stopX=target.x-dx/len*stop, stopY=target.y-dy/len*stop;
        if(this.refs.beeHalo) this.refs.beeHalo.setVisible(false);
        if(this.refs.beeLabel) this.refs.beeLabel.setVisible(false);
        const tile=this.refs.beeTargetTiles?.[dir];
        if(tile?.objects?.length) this.tweens.add({targets:tile.objects,scale:1.1,duration:160,yoyo:true,repeat:1});
        this.tweens.add({targets:bee,x:stopX,y:stopY,duration:520,ease:'Sine.inOut',onComplete:()=>{
          this.refs.beeApproachPos={x:stopX,y:stopY};
          this.popMessage('GẶP CHƯỚNG NGẠI - TRẢ LỜI CÂU HỎI','#fff7d6',C.amber);
          this.time.delayedCall(420,resolve);
        }});
      });
    }

    beeOutcome(ok,dir,blockedCount){
      return new Promise(resolve=>{
        const bee=this.refs.bee;
        if(!bee){resolve();return;}
        const target=this.refs.beeTargets?.[dir] || {x:bee.x,y:bee.y,valid:true};
        const home=this.refs.beeHome||{x:bee.x,y:bee.y};
        if(ok){
          this.tweens.killTweensOf(bee);
          const tile=this.refs.beeTargetTiles?.[dir];
          if(tile?.objects?.length){this.tweens.add({targets:tile.objects,alpha:0,scale:.15,duration:260,ease:'Back.in'});}
          const trail=this.add.circle(bee.x,bee.y,26,C.yellow,.22).setDepth(26);
          this.tweens.add({targets:trail,scale:2.2,alpha:0,duration:650,onComplete:()=>trail.destroy()});
          for(let i=0;i<12;i++){
            const s=this.add.image(bee.x,bee.y,'spark').setScale(.3+Math.random()*.25).setTint(i%2?0xffd43b:0xffffff).setDepth(35);
            this.tweens.add({targets:s,x:bee.x-25+Math.random()*50,y:bee.y-40+Math.random()*80,alpha:0,angle:180+Math.random()*200,duration:550+Math.random()*300,onComplete:()=>s.destroy()});
          }
          this.tweens.add({targets:bee,x:target.x,y:target.y,duration:430,ease:'Sine.inOut',onComplete:()=>{
            this.popMessage('ĐÚNG! VƯỢT QUA CHƯỚNG NGẠI','#d8ffeb',C.green);
            this.time.delayedCall(420,resolve);
          }});
        }else{
          this.cameras.main.shake(250,.008);
          const tile=this.refs.beeTargetTiles?.[dir];
          if(tile?.objects?.length) this.tweens.add({targets:tile.objects,angle:6,duration:70,yoyo:true,repeat:4});
          this.tweens.add({targets:bee,x:home.x,y:home.y,duration:470,ease:'Sine.inOut',onComplete:()=>{
            if(this.refs.beeHalo){this.refs.beeHalo.setPosition(home.x,home.y).setVisible(true);}
            if(this.refs.beeLabel){this.refs.beeLabel.setPosition(home.x,home.y-48).setVisible(true);}
            this.popMessage(blockedCount>=4?'HẾT ĐƯỜNG!':'SAI - HƯỚNG NÀY BỊ ĐÁ CHẶN','#ffe0e0',C.red);
            this.time.delayedCall(500,resolve);
          }});
        }
      });
    }
    directionPoint(dir,x,y){
      if(this.mode==='bee' && this.refs.beeTargets?.[dir]) return this.refs.beeTargets[dir];
      const d={up:[0,-85],down:[0,80],left:[-90,0],right:[90,0]}[dir]||[60,0];
      return {x:x+d[0],y:y+d[1]};
    }
    createPlayer(x,y,shirt=0x2c70d6,scale=1){
      const c=this.add.container(x,y).setScale(scale),g=this.add.graphics();
      g.fillStyle(0xf0b58b,1);g.fillCircle(0,-64,18);g.fillStyle(shirt,1);g.fillRoundedRect(-25,-48,50,60,10);g.fillStyle(0x192b3c,1);g.fillRect(-24,9,18,42);g.fillRect(6,9,18,42);g.fillStyle(0xf0b58b,1);g.fillRoundedRect(-41,-40,17,53,8);g.fillRoundedRect(24,-40,17,53,8);g.fillStyle(0x17222b,1);g.fillRect(-31,47,27,9);g.fillRect(5,47,27,9); c.add(g);return c;
    }
    createOwlKeeper(x,y,scale=1){
      const c=this.add.container(x,y).setScale(scale);
      const g=this.add.graphics();
      // shadow
      g.fillStyle(0x082137,.18);g.fillEllipse(0,69,92,20);
      // legs / shoes
      g.lineStyle(12,0xf6c14e,1);g.beginPath();g.moveTo(-20,35);g.lineTo(-24,58);g.moveTo(20,35);g.lineTo(24,58);g.strokePath();
      g.fillStyle(0xffffff,1);g.fillRoundedRect(-43,53,34,13,6);g.fillRoundedRect(9,53,34,13,6);g.fillStyle(0x173a65,1);g.fillRect(-42,62,34,5);g.fillRect(8,62,34,5);
      // body / goalkeeper jersey
      g.fillStyle(0xf8f9fb,1);g.fillRoundedRect(-42,-3,84,54,18);g.lineStyle(4,0x1c68aa,1);g.strokeRoundedRect(-42,-3,84,54,18);
      g.fillStyle(0x1f75bd,1);g.fillRoundedRect(-27,8,54,37,12);g.fillStyle(0xf6d13c,1);g.fillCircle(0,25,12);g.fillStyle(0x173a65,1);g.fillCircle(0,25,7);
      // wings / hands
      g.fillStyle(0xf4a93b,1);g.fillEllipse(-56,12,42,22);g.fillEllipse(56,12,42,22);
      for(let i=0;i<3;i++){g.lineStyle(5,0xf4a93b,1);g.beginPath();g.moveTo(-66-i*3,4+i*6);g.lineTo(-85-i*5,-2+i*3);g.moveTo(66+i*3,4+i*6);g.lineTo(85+i*5,-2+i*3);g.strokePath();}
      // head / owl tufts
      g.fillStyle(0x1562a6,1);g.fillTriangle(-45,-38,-30,-82,-12,-56);g.fillTriangle(45,-38,30,-82,12,-56);g.fillEllipse(0,-36,94,72);
      // eyes and glasses
      g.fillStyle(0xfff3c2,1);g.fillCircle(-21,-39,26);g.fillCircle(21,-39,26);g.lineStyle(5,0xf3c03d,1);g.strokeCircle(-21,-39,26);g.strokeCircle(21,-39,26);g.lineStyle(5,0xf3c03d,1);g.beginPath();g.moveTo(5,-40);g.lineTo(-5,-40);g.strokePath();
      g.fillStyle(0xffffff,1);g.fillCircle(-21,-39,16);g.fillCircle(21,-39,16);g.fillStyle(0x17344b,1);g.fillCircle(-18,-38,8);g.fillCircle(18,-38,8);g.fillStyle(0xffffff,1);g.fillCircle(-15,-42,3);g.fillCircle(15,-42,3);
      // beak
      g.fillStyle(0xf2a22f,1);g.fillTriangle(-9,-20,9,-20,0,-7);
      c.add(g); return c;
    }

    createBeeMiner(x,y,scale=1){
      const c=this.add.container(x,y).setScale(scale);
      const g=this.add.graphics();
      // shadow
      g.fillStyle(0x0d1b24,.18); g.fillEllipse(0,46,68,16);
      // wings
      g.fillStyle(0xeaf8ff,.72); g.fillEllipse(-20,-2,28,18); g.fillEllipse(12,-2,28,18);
      g.lineStyle(2,0xcfe6f2,.9); g.strokeEllipse(-20,-2,28,18); g.strokeEllipse(12,-2,28,18);
      // body
      g.fillStyle(C.yellow,1); g.fillEllipse(0,12,58,40); g.lineStyle(3,0x1a232b,1); g.strokeEllipse(0,12,58,40);
      g.fillStyle(0x1a232b,1); g.fillRect(-14,-3,8,28); g.fillRect(6,-3,8,28);
      // face
      g.fillStyle(0xffd574,1); g.fillCircle(25,6,18); g.lineStyle(3,0x1a232b,1); g.strokeCircle(25,6,18);
      g.fillStyle(0x1a232b,1); g.fillCircle(20,2,3); g.fillCircle(30,2,3); g.lineStyle(2,0x1a232b,1); g.beginPath(); g.moveTo(21,13); g.quadraticCurveTo(25,16,29,13); g.strokePath();
      // miner helmet
      g.fillStyle(0xf8c72d,1); g.fillRoundedRect(5,-20,42,16,7); g.fillCircle(26,-22,18); g.lineStyle(3,0x935f12,1); g.strokeRoundedRect(5,-20,42,16,7); g.strokeCircle(26,-22,18);
      g.fillStyle(0xf4f7ff,1); g.fillCircle(26,-22,8); g.lineStyle(2,0xa5b4c2,1); g.strokeCircle(26,-22,8); g.fillStyle(0x6ad6ff,1); g.fillCircle(26,-22,4);
      // feet
      g.lineStyle(5,0x1a232b,1); g.beginPath(); g.moveTo(-10,28); g.lineTo(-14,40); g.moveTo(10,28); g.lineTo(14,40); g.strokePath();
      c.add(g);
      return c;
    }

    drawSoccerChemGarden(){
      const g=this.add.graphics();
      // blue sky
      g.fillStyle(0x53c4f1,1);g.fillRect(0,0,W,150);
      g.fillStyle(0xaeeafd,1);g.fillRect(0,105,W,48);
      // clouds
      for(const [x,y] of [[250,52],[820,45]]){
        g.fillStyle(0xffffff,.88);g.fillCircle(x,y,18);g.fillCircle(x+22,y-8,23);g.fillCircle(x+47,y+1,16);g.fillRoundedRect(x-10,y,72,20,10);
      }
      // school / stands at right
      g.fillStyle(0xe8bf83,1);g.fillRect(785,85,175,92);g.fillStyle(0xc78b5d,1);g.fillRect(785,85,175,12);
      for(let r=0;r<2;r++)for(let c=0;c<4;c++){g.fillStyle(0x6eb6d5,1);g.fillRect(800+c*39,107+r*33,25,20);g.lineStyle(2,0xffffff,.7);g.strokeRect(800+c*39,107+r*33,25,20)}
      // garden hedge / flowers
      g.fillStyle(0x2e9850,1);g.fillRect(0,145,W,78);
      for(let i=0;i<36;i++){const x=(i*43+19)%960,y=157+(i%3)*17;g.fillStyle(i%3===0?0xffdd57:i%3===1?0xff8ca8:0xffffff,1);g.fillCircle(x,y,5);g.fillStyle(0x4e9b45,1);g.fillCircle(x,y+7,3)}
      // grass
      g.fillStyle(0x58b65c,1);g.fillRect(0,210,W,290);
      for(let i=0;i<8;i++){g.fillStyle(i%2?0x55b258:0x4da850,.45);g.fillRect(i*120,210,120,290)}
      // pitch markings
      g.lineStyle(4,0xffffff,.78);g.beginPath();g.moveTo(180,494);g.lineTo(940,494);g.strokePath();
      g.beginPath();g.moveTo(190,320);g.lineTo(930,320);g.strokePath();
      g.strokeCircle(560,463,45);
      // chemistry decorations: flasks and H2O stone
      g.fillStyle(0xf7fbff,.88);g.fillRoundedRect(35,178,52,45,8);g.fillStyle(0x35c4e5,1);g.fillRect(48,198,11,20);g.fillStyle(0xff8d5d,1);g.fillRect(65,193,11,25);
      g.fillStyle(0x8a8e83,1);g.fillEllipse(893,200,78,34);this.add.text(893,198,'H₂O',{fontFamily:'Arial',fontSize:'18px',fontStyle:'bold',color:'#41515a'}).setOrigin(.5);
    }
    showSoccer(o={}){
      this.clearScene();this.mode='soccer';this.drawSoccerChemGarden();
      this.refs.soccerLocked=false;this.refs.onSoccerAnswer=o.onAnswer||null;
      // left contestant / timer / score column
      const panelX=12,panelW=158;
      this.add.rectangle(panelX,10,panelW,118,0x07396a,.95).setOrigin(0).setStrokeStyle(3,0x68d6ff,.85);
      this.add.circle(panelX+79,43,27,0xeef7ff,1).setStrokeStyle(3,0xffffff,.8);
      this.add.circle(panelX+79,39,11,0xa8b7c5,1);this.add.ellipse(panelX+79,67,40,25,0xa8b7c5,1);
      const name=String(o.playerName||'Thí sinh');
      this.add.text(panelX+79,84,name.length>19?name.slice(0,18)+'…':name,{fontFamily:'Arial',fontSize:'14px',fontStyle:'bold',color:'#ffffff'}).setOrigin(.5);
      this.add.text(panelX+79,105,o.className?`Lớp ${o.className}`:'OLYMPIC HÓA HỌC',{fontFamily:'Arial',fontSize:'11px',color:'#bfe9ff'}).setOrigin(.5);

      this.add.rectangle(panelX,136,panelW,82,0x063d75,.97).setOrigin(0).setStrokeStyle(3,0x68d6ff,.85);
      this.add.text(panelX+18,150,'⏱  THỜI GIAN',{fontFamily:'Arial',fontSize:'13px',fontStyle:'bold',color:'#e7f8ff'});
      this.refs.soccerTimer=this.add.text(panelX+79,190,this.formatSoccerTime(o.timeLeft??120),{...labelStyle(32,'#ffd844'),strokeThickness:2}).setOrigin(.5);
      this.add.rectangle(panelX,226,panelW,82,0x07396a,.97).setOrigin(0).setStrokeStyle(3,0x68d6ff,.85);
      this.add.text(panelX+18,240,'★  ĐIỂM',{fontFamily:'Arial',fontSize:'13px',fontStyle:'bold',color:'#e7f8ff'});
      this.refs.soccerScore=this.add.text(panelX+79,282,String(o.score??0),{...labelStyle(34,'#ffd844'),strokeThickness:2}).setOrigin(.5);

      // question board like Violympic
      this.add.rectangle(185,13,760,122,0x9b6a25,1).setOrigin(0).setStrokeStyle(4,0x5b3b12,1);
      this.add.rectangle(192,20,746,108,0xfff8c9,1).setOrigin(0).setStrokeStyle(2,0xd8bc67,1);
      this.add.text(215,31,`CÂU ${o.question||1}/${o.total||10}`,{fontFamily:'Arial',fontSize:'14px',fontStyle:'bold',color:'#27854c'});
      const qRaw=String(o.questionText||'');const qFs=qRaw.length>155?16:qRaw.length>105?19:24;const qText=this.add.text(215,55,qRaw,{fontFamily:'Arial',fontSize:`${qFs}px`,fontStyle:'bold',color:'#1e2730',wordWrap:{width:690,useAdvancedWrap:true},lineSpacing:4});
      qText.setOrigin(0,0);

      // goal and net
      const gx=405,gy=151,gw=310,gh=160;
      const net=this.add.graphics();net.lineStyle(8,0xffffff,1);net.strokeRect(gx,gy,gw,gh);net.lineStyle(2,0xdcecf1,.72);
      for(let x=gx+20;x<gx+gw;x+=20){net.beginPath();net.moveTo(x,gy);net.lineTo(x,gy+gh);net.strokePath()}
      for(let y=gy+16;y<gy+gh;y+=16){net.beginPath();net.moveTo(gx,y);net.lineTo(gx+gw,y);net.strokePath()}
      this.refs.net=net;
      // keeper mascot
      const keeper=this.createOwlKeeper(560,250,.78);this.refs.keeper=keeper;
      // ball at kick spot
      const ball=this.add.image(560,470,'soccerBall').setScale(.63);ball.setDepth(8);this.refs.ball=ball;
      this.add.ellipse(560,487,88,15,0x1f7d3d,.35).setDepth(7);

      // answer panels: two columns, two rows
      const options=(o.options||[]).slice(0,4);this.refs.soccerButtons=[];
      const positions=[[365,351],[760,351],[365,417],[760,417]];
      options.forEach((txt,i)=>{
        const [x,y]=positions[i];const c=this.add.container(x,y).setDepth(10);
        const bg=this.add.rectangle(0,0,350,56,0xfff9d7,1).setStrokeStyle(4,0x8b6328,1);
        const badge=this.add.circle(-145,0,22,0x124e9f,1).setStrokeStyle(3,0xffffff,1);
        const letter=this.add.text(-145,0,'ABCD'[i],{fontFamily:'Arial',fontSize:'22px',fontStyle:'bold',color:'#ffffff'}).setOrigin(.5);
        const fs=String(txt).length>36?16:String(txt).length>24?18:21;
        const t=this.add.text(-112,0,String(txt),{fontFamily:'Arial',fontSize:`${fs}px`,fontStyle:'bold',color:'#202832',wordWrap:{width:270,useAdvancedWrap:true},lineSpacing:1}).setOrigin(0,.5);
        c.add([bg,badge,letter,t]);
        bg.setInteractive({useHandCursor:true});
        bg.on('pointerover',()=>{if(!this.refs.soccerLocked){bg.setFillStyle(0xffef9f,1);c.setScale(1.018)}});
        bg.on('pointerout',()=>{if(!this.refs.soccerLocked){bg.setFillStyle(0xfff9d7,1);c.setScale(1)}});
        bg.on('pointerdown',()=>this.chooseSoccerAnswer(i));
        this.refs.soccerButtons.push({c,bg,badge,letter,t});
      });
      this.add.text(560,334,'CHỌN ĐÁP ÁN ĐỂ THỰC HIỆN CÚ SÚT',{fontFamily:'Arial',fontSize:'12px',fontStyle:'bold',color:'#eafaff'}).setOrigin(.5).setDepth(9);
    }
    formatSoccerTime(sec){sec=Math.max(0,Math.floor(Number(sec)||0));return `${String(Math.floor(sec/60)).padStart(2,'0')}:${String(sec%60).padStart(2,'0')}`;}
    chooseSoccerAnswer(i){
      if(this.refs.soccerLocked)return;
      this.refs.soccerLocked=true;
      (this.refs.soccerButtons||[]).forEach((b,idx)=>{b.bg.disableInteractive();b.c.setScale(idx===i?1.03:1);b.bg.setFillStyle(idx===i?0xffe36d:0xf3edcf,1);b.badge.setFillStyle(idx===i?0xf0a825:0x607b96,1)});
      if(this.refs.onSoccerAnswer)this.refs.onSoccerAnswer(String(i));
    }
    lockSoccerAnswers(){this.refs.soccerLocked=true;(this.refs.soccerButtons||[]).forEach(b=>b.bg.disableInteractive());}
    unlockSoccerAnswers(){this.refs.soccerLocked=false;(this.refs.soccerButtons||[]).forEach(b=>{b.bg.setInteractive({useHandCursor:true});b.bg.setFillStyle(0xfff9d7,1);b.c.setScale(1);b.badge.setFillStyle(0x124e9f,1)});}
    updateSoccerTimer(sec){if(this.refs.soccerTimer){this.refs.soccerTimer.setText(this.formatSoccerTime(sec));this.refs.soccerTimer.setColor(sec<=30?'#ff8b92':'#ffd844');}}
    updateSoccerScore(v){if(this.refs.soccerScore)this.refs.soccerScore.setText(String(v));}
    soccerOutcome(ok){
      return new Promise(resolve=>{const ball=this.refs.ball,keeper=this.refs.keeper;if(!ball){resolve();return;}const miss=!ok&&Math.random()<.42;
        const kick=this.add.text(560,465,'💥',{fontFamily:'Arial',fontSize:'26px'}).setOrigin(.5).setDepth(12).setAlpha(0);this.tweens.add({targets:kick,alpha:1,scale:1.7,duration:120,yoyo:true,onComplete:()=>kick.destroy()});
        if(ok){
          const side=Math.random()<.5?-1:1;this.tweens.add({targets:keeper,x:keeper.x-side*82,y:keeper.y-18,rotation:-side*.48,duration:520,ease:'Cubic.out'});
          this.tweens.add({targets:ball,x:560+side*92,y:222,scale:.42,angle:540,duration:820,ease:'Cubic.in',onComplete:()=>{this.cameras.main.shake(140,.003);this.netPulse();this.soccerResultBanner('VÀOOOO!  +10 ĐIỂM',true);this.spawnSoccerConfetti();this.time.delayedCall(900,resolve);}});
        }else if(miss){
          this.tweens.add({targets:keeper,x:keeper.x+45,y:keeper.y-24,rotation:.28,duration:500});this.tweens.add({targets:ball,x:820,y:145,scale:.4,angle:620,duration:850,ease:'Cubic.in',onComplete:()=>{this.soccerResultBanner('BÓNG ĐI RA NGOÀI',false);this.time.delayedCall(800,resolve);}});
        }else{
          const side=Math.random()<.5?-1:1;this.tweens.add({targets:keeper,x:keeper.x+side*76,y:keeper.y-35,rotation:side*.62,duration:540,ease:'Cubic.out'});this.tweens.add({targets:ball,x:keeper.x+side*54,y:keeper.y-15,scale:.47,angle:320,duration:610,ease:'Cubic.in',onComplete:()=>{this.tweens.add({targets:ball,y:390,x:keeper.x+side*92,duration:300,ease:'Bounce.out'});this.soccerResultBanner('THỦ MÔN CẢN PHÁ!',false);this.time.delayedCall(900,resolve);}});
        }
      });
    }
    soccerResultBanner(text,good){
      const col=good?0x138c57:0xb7333f;const box=this.add.rectangle(560,304,360,46,col,.96).setDepth(30).setStrokeStyle(3,0xffffff,.75).setScale(.7).setAlpha(0);const t=this.add.text(560,304,text,{...labelStyle(23,'#ffffff'),strokeThickness:2}).setOrigin(.5).setDepth(31).setScale(.7).setAlpha(0);this.tweens.add({targets:[box,t],alpha:1,scale:1,duration:220,ease:'Back.out',hold:450,yoyo:true,onComplete:()=>{box.destroy();t.destroy();}});
    }
    spawnSoccerConfetti(){for(let i=0;i<28;i++){const x=420+Math.random()*280,y=155+Math.random()*70;const s=this.add.image(x,y,'spark').setTint([0xffd43b,0x5ee4ff,0xff7887,0xffffff][i%4]).setScale(.28+Math.random()*.25).setDepth(25);this.tweens.add({targets:s,x:x-60+Math.random()*120,y:y+110+Math.random()*80,angle:300+Math.random()*360,alpha:0,duration:700+Math.random()*500,onComplete:()=>s.destroy()});}}
    netPulse(){const r=this.add.rectangle(this.mode==='soccer'?560:790,this.mode==='soccer'?230:357,this.mode==='soccer'?310:215,this.mode==='soccer'?160:140,0x9fffc4,.13);this.tweens.add({targets:r,alpha:0,scale:1.08,duration:550,onComplete:()=>r.destroy()});}

    showBasketball(o={}){
      this.clearScene();
      this.mode='basketball';
      this.refs.basketLocked=false;
      this.refs.onBasketAnswer=o.onAnswer||null;
      // arena background
      const bg=this.add.graphics();
      bg.fillStyle(0x13304a,1); bg.fillRect(0,0,W,165);
      bg.fillStyle(0x1e4566,1); bg.fillRect(0,95,W,70);
      for(let row=0;row<4;row++) for(let i=0;i<32;i++){
        bg.fillStyle([0xf7f7f7,0xf7b733,0x4e86d7,0xe0626b][(i+row)%4],.72);
        bg.fillCircle(16+i*30,112+row*16,4.5);
      }
      bg.fillStyle(0xc67e42,1); bg.fillRect(0,165,W,335);
      for(let i=0;i<12;i++){ bg.fillStyle(i%2?0xcf8851:0xba7239,.35); bg.fillRect(i*80,165,80,335); }
      bg.lineStyle(5,0xffffff,.78); bg.beginPath(); bg.moveTo(110,470); bg.lineTo(850,470); bg.strokePath();
      bg.strokeCircle(480,468,138);
      bg.fillStyle(0x7cb8de,1); bg.fillRect(720,92,150,70); bg.fillStyle(0x9dd7f1,1); bg.fillRect(730,104,28,24); bg.fillRect(770,104,28,24); bg.fillRect(810,104,28,24);
      bg.fillStyle(0x5aa15b,1); bg.fillRect(0,145,W,20);

      // left contestant / timer / score column
      const panelX=12,panelW=158;
      this.add.rectangle(panelX,10,panelW,118,0x6a3414,.95).setOrigin(0).setStrokeStyle(3,0xf0d08b,.85);
      this.add.circle(panelX+79,43,27,0xeef7ff,1).setStrokeStyle(3,0xffffff,.8);
      this.add.circle(panelX+79,39,11,0xa8b7c5,1); this.add.ellipse(panelX+79,67,40,25,0xa8b7c5,1);
      const name=String(o.playerName||'Thí sinh');
      this.add.text(panelX+79,84,name.length>19?name.slice(0,18)+'…':name,{fontFamily:'Arial',fontSize:'14px',fontStyle:'bold',color:'#ffffff'}).setOrigin(.5);
      this.add.text(panelX+79,105,o.className?`Lớp ${o.className}`:'OLYMPIC HÓA HỌC',{fontFamily:'Arial',fontSize:'11px',color:'#fff0d8'}).setOrigin(.5);

      this.add.rectangle(panelX,136,panelW,82,0x7b4318,.97).setOrigin(0).setStrokeStyle(3,0xf0d08b,.85);
      this.add.text(panelX+18,150,'⏱  THỜI GIAN',{fontFamily:'Arial',fontSize:'13px',fontStyle:'bold',color:'#fff8e7'});
      this.refs.basketTimer=this.add.text(panelX+79,190,this.formatSoccerTime(o.timeLeft??120),{...labelStyle(32,'#ffd844'),strokeThickness:2}).setOrigin(.5);
      this.add.rectangle(panelX,226,panelW,82,0x6a3414,.97).setOrigin(0).setStrokeStyle(3,0xf0d08b,.85);
      this.add.text(panelX+18,240,'★  ĐIỂM',{fontFamily:'Arial',fontSize:'13px',fontStyle:'bold',color:'#fff8e7'});
      this.refs.basketScore=this.add.text(panelX+79,282,String(o.score??0),{...labelStyle(34,'#ffd844'),strokeThickness:2}).setOrigin(.5);

      // top board with question
      this.add.rectangle(185,13,760,122,0x9b6a25,1).setOrigin(0).setStrokeStyle(4,0x5b3b12,1);
      this.add.rectangle(192,20,746,108,0xfff8c9,1).setOrigin(0).setStrokeStyle(2,0xd8bc67,1);
      this.add.text(215,31,`CÂU ${o.question||1}/${o.total||10}`,{fontFamily:'Arial',fontSize:'14px',fontStyle:'bold',color:'#b15c17'});
      const qRaw=String(o.questionText||'');
      const qFs=qRaw.length>155?16:qRaw.length>105?19:24;
      const qText=this.add.text(215,55,qRaw,{fontFamily:'Arial',fontSize:`${qFs}px`,fontStyle:'bold',color:'#1e2730',wordWrap:{width:690,useAdvancedWrap:true},lineSpacing:4});
      qText.setOrigin(0,0);

      // board and hoop
      this.add.rectangle(793,185,132,90,0xf4fbff,.96).setStrokeStyle(5,0x54636f,1);
      this.add.rectangle(793,193,58,42,0xffffff,0).setStrokeStyle(3,0xd95c45,1);
      const rim=this.add.ellipse(793,243,82,20,0xd95c45,0).setStrokeStyle(7,0xd95c45,1); this.refs.rim=rim;
      const ng=this.add.graphics(); ng.lineStyle(2,0xffffff,.78);
      for(let i=-30;i<=30;i+=15){ ng.beginPath(); ng.moveTo(793+i,250); ng.lineTo(793+i*.55,304); ng.strokePath(); }
      ng.lineStyle(2,0xffffff,.55); [263,278,292].forEach(y=>{ ng.beginPath(); ng.moveTo(767,y); ng.lineTo(819,y); ng.strokePath(); });
      this.refs.player=this.createPlayer(255,396,0x8d4fc5,1.13);
      const ball=this.add.image(345,402,'basketBall').setScale(.72).setDepth(8); this.refs.ball=ball;
      this.add.ellipse(345,420,90,15,0x7b4f29,.25).setDepth(7);
      this.add.text(793,325,'CHỌN ĐÁP ÁN ĐỂ THỰC HIỆN CÚ NÉM',{fontFamily:'Arial',fontSize:'12px',fontStyle:'bold',color:'#fff1df'}).setOrigin(.5);

      // answer panels on the court
      const options=(o.options||[]).slice(0,4); this.refs.basketButtons=[];
      const positions=[[365,332],[760,332],[365,408],[760,408]];
      options.forEach((txt,i)=>{
        const [x,y]=positions[i]; const c=this.add.container(x,y).setDepth(10);
        const bg=this.add.rectangle(0,0,350,56,0xfff9d7,1).setStrokeStyle(4,0x8b6328,1);
        const badge=this.add.circle(-145,0,22,0xb75e18,1).setStrokeStyle(3,0xffffff,1);
        const letter=this.add.text(-145,0,'ABCD'[i],{fontFamily:'Arial',fontSize:'22px',fontStyle:'bold',color:'#ffffff'}).setOrigin(.5);
        const fs=String(txt).length>36?16:String(txt).length>24?18:21;
        const t=this.add.text(-112,0,String(txt),{fontFamily:'Arial',fontSize:`${fs}px`,fontStyle:'bold',color:'#202832',wordWrap:{width:270,useAdvancedWrap:true},lineSpacing:1}).setOrigin(0,.5);
        c.add([bg,badge,letter,t]);
        bg.setInteractive({useHandCursor:true});
        bg.on('pointerover',()=>{ if(!this.refs.basketLocked){ bg.setFillStyle(0xffef9f,1); c.setScale(1.018); } });
        bg.on('pointerout',()=>{ if(!this.refs.basketLocked){ bg.setFillStyle(0xfff9d7,1); c.setScale(1); } });
        bg.on('pointerdown',()=>this.chooseBasketballAnswer(i));
        this.refs.basketButtons.push({c,bg,badge,letter,t});
      });
    }
    chooseBasketballAnswer(i){
      if(this.refs.basketLocked) return;
      this.refs.basketLocked=true;
      (this.refs.basketButtons||[]).forEach((b,idx)=>{ b.bg.disableInteractive(); b.c.setScale(idx===i?1.03:1); b.bg.setFillStyle(idx===i?0xffd36b:0xf3edcf,1); b.badge.setFillStyle(idx===i?0xd56c1c:0x8a8e95,1); });
      if(this.refs.onBasketAnswer) this.refs.onBasketAnswer(String(i));
    }
    lockBasketballAnswers(){ this.refs.basketLocked=true; (this.refs.basketButtons||[]).forEach(b=>b.bg.disableInteractive()); }
    unlockBasketballAnswers(){ this.refs.basketLocked=false; (this.refs.basketButtons||[]).forEach(b=>{ b.bg.setInteractive({useHandCursor:true}); b.bg.setFillStyle(0xfff9d7,1); b.c.setScale(1); b.badge.setFillStyle(0xb75e18,1); }); }
    updateBasketballTimer(sec){ if(this.refs.basketTimer){ this.refs.basketTimer.setText(this.formatSoccerTime(sec)); this.refs.basketTimer.setColor(sec<=30?'#ff8b92':'#ffd844'); } }
    updateBasketballScore(v){ if(this.refs.basketScore) this.refs.basketScore.setText(String(v)); }
    updateBeeTimer(sec){ if(this.refs.beeTimer){ this.refs.beeTimer.setText(this.formatSoccerTime(sec)); this.refs.beeTimer.setColor(sec<=60?'#ff8b92':'#ffd844'); } }
    updateBeeScore(v){ if(this.refs.beeScore) this.refs.beeScore.setText(String(v)); }
    basketballOutcome(ok){
      return new Promise(resolve=>{
        const ball=this.refs.ball;
        if(!ball){ resolve(); return; }
        const start=new Phaser.Math.Vector2(ball.x,ball.y), control=new Phaser.Math.Vector2(565,115), end=ok?new Phaser.Math.Vector2(793,255):new Phaser.Math.Vector2(830,232);
        const curve=new Phaser.Curves.QuadraticBezier(start,control,end); const state={t:0};
        this.tweens.add({targets:this.refs.player,rotation:-.12,duration:180,yoyo:true});
        this.tweens.add({targets:state,t:1,duration:980,ease:'Sine.inOut',onUpdate:()=>{ const p=curve.getPoint(state.t); ball.setPosition(p.x,p.y); ball.angle+=18; },onComplete:()=>{
          if(ok){
            this.tweens.add({targets:ball,y:325,scale:.55,duration:330,ease:'Quad.in',onComplete:()=>{ this.popMessage('SWISH! +10','#fff4df',C.orange); for(let i=0;i<12;i++){ const s=this.add.image(793,255,'spark').setTint(0xffc54d).setScale(.35); this.tweens.add({targets:s,x:755+Math.random()*76,y:225+Math.random()*90,alpha:0,duration:650,onComplete:()=>s.destroy()}); } this.time.delayedCall(600,resolve); }});
          }else{
            this.tweens.add({targets:ball,x:742,y:390,angle:ball.angle+360,duration:520,ease:'Bounce.out'}); this.tweens.add({targets:this.refs.rim,scaleX:1.08,duration:90,yoyo:true,repeat:2}); this.popMessage('BẬT VÀNH!','#ffe4e4',C.red); this.time.delayedCall(850,resolve);
          }
        }});
      });
    }
    showRacing(o={}){

      this.clearScene();this.mode='racing';this.addSky(0x75cff4,0xc5efff);this.drawHills();this.addHeader('LÁI XE VƯỢT CHƯỚNG NGẠI','4 ý Đúng/Sai • Tối đa 50 điểm/câu • 10 phút/câu',C.cyan);
      // trees
      const scenery=this.add.graphics();for(let i=0;i<12;i++){const x=35+i*84,y=300+(i%3)*16;scenery.fillStyle(0x81522f,1);scenery.fillRect(x-4,y,8,38);scenery.fillStyle(0x2c8b49,1);scenery.fillCircle(x,y-8,24);scenery.fillCircle(x-15,y,16);scenery.fillCircle(x+15,y,16)}
      // perspective road
      const road=this.add.graphics();road.fillStyle(C.road,1);road.fillTriangle(210,H,750,H,590,260);road.fillTriangle(210,H,590,260,370,260);road.lineStyle(8,0xf1cc4f,1);road.beginPath();road.moveTo(210,H);road.lineTo(370,260);road.moveTo(750,H);road.lineTo(590,260);road.strokePath();
      road.lineStyle(5,0xffffff,.8);for(let i=0;i<6;i++){const y=292+i*39,w=6+i*7;road.beginPath();road.moveTo(480-w,y);road.lineTo(480+w,y+22);road.strokePath();}
      const progress=clamp(o.progress||0,0,100); const bx=330+(progress/100)*300, by=424-(progress/100)*80;
      const bike=this.createBike(bx,by,.92-(progress/100)*.12);this.refs.bike=bike;this.refs.raceStart={x:bx,y:by};this.refs.progress=progress;
      // obstacle ahead
      const obsX=570+(progress*.8),obsY=360-(progress*.25);this.createBarrier(clamp(obsX,560,720),clamp(obsY,305,365));
      // finish
      this.add.rectangle(620,278,7,82,0xf5f5f5,1);this.add.rectangle(628,278,58,38,0xffffff,1).setOrigin(0,0);for(let r=0;r<4;r++)for(let c=0;c<6;c++)if((r+c)%2===0)this.add.rectangle(633+c*9,283+r*8,9,8,0x111111,1);
      // progress meter
      this.add.rectangle(735,35,190,28,0x061724,.82).setOrigin(0).setStrokeStyle(1,0xffffff,.16);this.add.rectangle(742,42,176*(progress/100),14,C.cyan,1).setOrigin(0);this.add.text(830,49,`${Math.round(progress)}%`,{fontFamily:'Arial',fontSize:'14px',fontStyle:'bold',color:'#ffffff'}).setOrigin(.5);
      this.add.text(830,75,'TIẾN ĐỘ ĐẾN ĐÍCH',{fontFamily:'Arial',fontSize:'12px',fontStyle:'bold',color:'#c8dce9'}).setOrigin(.5);
    }
    createBike(x,y,scale=1){
      const c=this.add.container(x,y).setScale(scale),g=this.add.graphics();g.fillStyle(0x151a1e,1);g.fillCircle(-35,20,25);g.fillCircle(38,20,25);g.fillStyle(0x8d99a2,1);g.fillCircle(-35,20,15);g.fillCircle(38,20,15);g.lineStyle(8,C.red,1);g.beginPath();g.moveTo(-35,20);g.lineTo(-5,-16);g.lineTo(26,17);g.lineTo(-17,12);g.lineTo(15,-10);g.strokePath();g.lineStyle(7,0x27313a,1);g.beginPath();g.moveTo(15,-10);g.lineTo(31,-34);g.moveTo(23,-31);g.lineTo(43,-31);g.strokePath();g.fillStyle(0x25303a,1);g.fillRoundedRect(-16,-28,35,12,5);g.fillStyle(0xf0b58b,1);g.fillCircle(-5,-63,12);g.fillStyle(0x1f70c5,1);g.fillRoundedRect(-19,-52,30,31,8);g.lineStyle(6,0x1f70c5,1);g.beginPath();g.moveTo(5,-37);g.lineTo(28,-25);g.strokePath();c.add(g);return c;
    }
    createBarrier(x,y){const c=this.add.container(x,y),g=this.add.graphics();g.fillStyle(0x574338,1);g.fillRect(-42,21,8,35);g.fillRect(34,21,8,35);g.fillStyle(0xfff4e6,1);g.fillRoundedRect(-48,-5,96,28,5);for(let i=-45;i<45;i+=24){g.fillStyle(C.orange,1);g.fillTriangle(i,-5,i+13,-5,i+1,23);}c.add(g);return c;}
    racingOutcome(points){
      return new Promise(resolve=>{const bike=this.refs.bike;if(!bike){resolve();return;}const add=points>=50?42:points>=25?28:points>=15?18:points>=5?10:4;const target=clamp((this.refs.progress||0)+add,0,100);const dx=(target-(this.refs.progress||0))*3.0,dy=-(target-(this.refs.progress||0))*.8;
        if(points>0){this.tweens.add({targets:bike,x:bike.x+dx,y:bike.y+dy,duration:1000,ease:'Cubic.out',onUpdate:()=>{bike.rotation=Math.sin(this.time.now/80)*.02},onComplete:()=>{bike.rotation=0;this.popMessage(`+${points} ĐIỂM • TĂNG TỐC!`,'#e8fbff',C.cyan);this.time.delayedCall(550,resolve);}});}
        else{this.cameras.main.shake(280,.007);this.tweens.add({targets:bike,x:'-=12',duration:95,yoyo:true,repeat:3});this.popMessage('CHƯA VƯỢT ĐƯỢC CHƯỚNG NGẠI','#ffe4e4',C.red);this.time.delayedCall(850,resolve);}
      });
    }
    popMessage(text,color='#fff',accent=C.yellow){
      const box=this.add.rectangle(W/2,160,520,82,0x061724,.9).setStrokeStyle(3,accent,.9).setScale(.65).setAlpha(0);const t=this.add.text(W/2,160,text,{...labelStyle(30,color),strokeThickness:3}).setOrigin(.5).setScale(.65).setAlpha(0);
      this.tweens.add({targets:[box,t],alpha:1,scale:1,duration:260,ease:'Back.out',hold:520,yoyo:true,onComplete:()=>{box.destroy();t.destroy();}});
    }
  }

  let game=null, scene=null, ready=false;
  function ensure(){
    if(game) return;
    game=new Phaser.Game({
      type:Phaser.AUTO,parent:'phaser-stage',width:W,height:H,transparent:false,backgroundColor:'#071a28',
      antialias:true,render:{pixelArt:false,roundPixels:false},
      scale:{mode:Phaser.Scale.FIT,autoCenter:Phaser.Scale.CENTER_BOTH,width:W,height:H},
      scene:MainScene
    });
    game.events.once('chem-ready',()=>{scene=game.scene.getScene('Main');ready=true;document.dispatchEvent(new CustomEvent('chem-games-ready'));});
  }
  function withScene(fn){ if(ready&&scene)fn(scene); else document.addEventListener('chem-games-ready',()=>fn(scene),{once:true}); }
  function showBee(opts){withScene(s=>s.showBee(opts));}
  function showSoccer(opts){withScene(s=>s.showSoccer(opts));}
  function updateSoccerTimer(sec){withScene(s=>s.updateSoccerTimer(sec));}
  function updateSoccerScore(v){withScene(s=>s.updateSoccerScore(v));}
  function updateBeeTimer(sec){withScene(s=>s.updateBeeTimer(sec));}
  function updateBeeScore(v){withScene(s=>s.updateBeeScore(v));}
  function approachBeeObstacle(dir){return new Promise(resolve=>withScene(s=>Promise.resolve(s.beeApproachObstacle(dir)).then(resolve)));}
  function lockBeeDirections(){withScene(s=>s.lockBeeDirections());}
  function unlockBeeDirections(){withScene(s=>s.unlockBeeDirections());}
  function lockSoccerAnswers(){withScene(s=>s.lockSoccerAnswers());}
  function unlockSoccerAnswers(){withScene(s=>s.unlockSoccerAnswers());}
  function showBasketball(opts){withScene(s=>s.showBasketball(opts));}
  function updateBasketballTimer(sec){withScene(s=>s.updateBasketballTimer(sec));}
  function updateBasketballScore(v){withScene(s=>s.updateBasketballScore(v));}
  function lockBasketballAnswers(){withScene(s=>s.lockBasketballAnswers());}
  function unlockBasketballAnswers(){withScene(s=>s.unlockBasketballAnswers());}
  function showRacing(opts){withScene(s=>s.showRacing(opts));}
  function outcome(type,ok,extra={}){return new Promise(resolve=>withScene(s=>{let p;if(type==='bee')p=s.beeOutcome(ok,extra.direction,extra.blockedCount||0);else if(type==='soccer')p=s.soccerOutcome(ok);else if(type==='basketball')p=s.basketballOutcome(ok);else p=s.racingOutcome(extra.points||0);Promise.resolve(p).then(resolve);}));}
  function selectDirection(dir){withScene(s=>s.selectDirection(dir));}
  function destroy(){if(game){game.destroy(true);game=null;scene=null;ready=false;}}

  window.ChemGames={ready:true,ensure,showBee,showSoccer,updateSoccerTimer,updateSoccerScore,updateBeeTimer,updateBeeScore,approachBeeObstacle,lockBeeDirections,unlockBeeDirections,lockSoccerAnswers,unlockSoccerAnswers,showBasketball,updateBasketballTimer,updateBasketballScore,lockBasketballAnswers,unlockBasketballAnswers,showRacing,outcome,selectDirection,destroy};
})();
